from fastapi import FastAPI, UploadFile, File
import pandas as pd
import joblib
import numpy as np
import json
import os

from fastapi.middleware.cors import CORSMiddleware
from ml_model import attack_category_map, get_risk_level

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------
# Load Models & Files
# -------------------------

rf_model = joblib.load(os.path.join(BASE_DIR, "rf_model.pkl"))
svm_model = joblib.load(os.path.join(BASE_DIR, "svm_model.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))

# -------------------------
# Feature List (IMPORTANT)
# -------------------------

selected_features = [
    "duration","protocol_type","service","flag","src_bytes","dst_bytes",
    "wrong_fragment","num_compromised","num_root","count","srv_count",
    "serror_rate","srv_serror_rate","same_srv_rate","diff_srv_rate",
    "dst_host_count","dst_host_srv_count","dst_host_same_srv_rate",
    "dst_host_diff_srv_rate","dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate","dst_host_serror_rate",
    "dst_host_srv_serror_rate","dst_host_rerror_rate",
    "dst_host_srv_rerror_rate"
]

categorical_cols = ["protocol_type", "service", "flag"]
numerical_cols = [c for c in selected_features if c not in categorical_cols]

# -------------------------
# CSV Upload API
# -------------------------

@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):

    try:
        # Read CSV
        df = pd.read_csv(file.file)

        # Before validation chart data (e.g., protocol types counts)
        before_val_counts = df["protocol_type"].value_counts().to_dict()
        before_validation_data = [{"name": str(k), "value": int(v)} for k, v in before_val_counts.items()]

        # Add missing features with safe defaults
        for f in selected_features:
            if f not in df.columns:
                df[f] = "unknown" if f in categorical_cols else 0.0

        # Keep only required columns
        df = df[selected_features]

        # Normalize dtypes to match OneHot pipeline training:
        # - categorical: strings
        # - numeric: float
        for col in categorical_cols:
            if col in df.columns:
                df[col] = df[col].fillna("unknown").astype(str)
        for col in numerical_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        # -------------------------
        # SVM Prediction (binary)
        # -------------------------

        # Note: if scaler is missing, prediction still works on raw features (may be less accurate).
        try:
            svm_pred = svm_model.predict(df)
        except Exception:
            svm_pred = [1] * len(df)

        # -------------------------
        # Random Forest Prediction
        # -------------------------

        rf_pred = rf_model.predict(df)
        rf_probs = rf_model.predict_proba(df)

        # -------------------------
        # Build response
        # -------------------------

        predictions = []
        after_val_counts = {}

        for i in range(len(df)):
            prediction = rf_pred[i]
            confidence = round(float(max(rf_probs[i])) * 100, 2)

            attack_type = label_encoder.inverse_transform([prediction])[0]
            category = attack_category_map.get(attack_type, "Unknown")
            risk_level = get_risk_level(category, confidence)

            # Override with SVM Stage 1 if normal (0 means Normal for binary SVM)
            if svm_pred[i] == 0:
                status = "Normal Traffic"
                attack_type = "normal"
                category = "Normal"
                risk_level = "Low"
                confidence = 100.0
            else:
                status = "Attack Detected"

            after_val_counts[category] = after_val_counts.get(category, 0) + 1

            predictions.append({
                "status": status,
                "attack_type": attack_type,
                "attack_category": category,
                "risk_level": risk_level,
                "confidence_percentage": confidence
            })

        # -------------------------
        # Load metrics + confusion
        # -------------------------

        with open(os.path.join(BASE_DIR, "metrics.json")) as f:
            metrics = json.load(f)

        svm_rf_comparison = [
            {"name": "SVM", "accuracy": metrics.get("svm_accuracy", 0) * 100},
            {"name": "Random Forest", "accuracy": metrics.get("rf_accuracy", 0) * 100}
        ]

        cm = np.load(os.path.join(BASE_DIR, "confusion_matrix.npy")).tolist()

        return {
            "predictions": predictions,
            "metrics": metrics,
            "graph_before_validation": before_validation_data,
            "graph_after_validation": [{"name": k, "value": v} for k, v in after_val_counts.items()],
            "graph_svm_vs_rf": svm_rf_comparison,
            "confusion_matrix": cm
        }

    except Exception as e:
        return {"error": str(e)}