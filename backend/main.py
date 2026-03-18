from fastapi import FastAPI, UploadFile, File
import pandas as pd
import joblib
import numpy as np
import json

app = FastAPI()

# -------------------------
# Load Models & Files
# -------------------------

rf_model = joblib.load("rf_model.pkl")
xgb_model = joblib.load("xgb_model.pkl")
svm_model = joblib.load("svm_model.pkl")
encoders = joblib.load("encoders.pkl")
label_encoder = joblib.load("label_encoder.pkl")
scaler = joblib.load("scaler.pkl")

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

# -------------------------
# CSV Upload API
# -------------------------

@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):

    try:
        # Read CSV
        df = pd.read_csv(file.file)

        # Keep only required columns
        df = df[selected_features]

        # Encode categorical
        for col in ["protocol_type", "service", "flag"]:
            df[col] = encoders[col].transform(df[col])

        # -------------------------
        # SVM Prediction (binary)
        # -------------------------

        df_scaled = scaler.transform(df)
        svm_pred = svm_model.predict(df_scaled)

        # -------------------------
        # XGBoost Prediction
        # -------------------------

        xgb_pred = xgb_model.predict(df)
        xgb_probs = xgb_model.predict_proba(df)

        attack_types = label_encoder.inverse_transform(xgb_pred)

        # -------------------------
        # Build response
        # -------------------------

        predictions = []

        for i in range(len(df)):

            status = "Attack Detected" if svm_pred[i] == 1 else "Normal Traffic"
            confidence = round(float(max(xgb_probs[i])) * 100, 2)

            predictions.append({
                "status": status,
                "attack_type": attack_types[i],
                "confidence": confidence
            })

        # -------------------------
        # Load metrics + confusion
        # -------------------------

        with open("metrics.json") as f:
            metrics = json.load(f)

        cm_rf = np.load("cm_rf.npy").tolist()
        cm_xgb = np.load("cm_xgb.npy").tolist()

        return {
            "predictions": predictions,
            "metrics": metrics,
            "confusion_matrix_rf": cm_rf,
            "confusion_matrix_xgb": cm_xgb
        }

    except Exception as e:
        return {"error": str(e)}