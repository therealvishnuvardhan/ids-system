from fastapi import FastAPI, UploadFile, File
import pandas as pd
import joblib
import numpy as np
import json
import io
import os

from fastapi.middleware.cors import CORSMiddleware
from ml_model import (
    svm_model, xgb_model, scaler,
    label_encoder, feature_columns,
    cat_display, cat_representative, get_risk_level
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────
# Column definitions
# ─────────────────────────────────

ALL_COLUMNS = [
    "duration","protocol_type","service","flag","src_bytes","dst_bytes","land",
    "wrong_fragment","urgent","hot","num_failed_logins","logged_in","num_compromised",
    "root_shell","su_attempted","num_root","num_file_creations","num_shells",
    "num_access_files","num_outbound_cmds","is_host_login","is_guest_login",
    "count","srv_count","serror_rate","srv_serror_rate","rerror_rate",
    "srv_rerror_rate","same_srv_rate","diff_srv_rate","srv_diff_host_rate",
    "dst_host_count","dst_host_srv_count","dst_host_same_srv_rate",
    "dst_host_diff_srv_rate","dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate","dst_host_serror_rate",
    "dst_host_srv_serror_rate","dst_host_rerror_rate","dst_host_srv_rerror_rate"
]

categorical_cols = ["protocol_type","service","flag"]
numerical_cols   = [c for c in ALL_COLUMNS if c not in categorical_cols]


def _batch_predict(df: pd.DataFrame):
    """
    Build OHE features and run both models on every row.
    Returns: svm_preds, xgb_preds, svm_probas
    """
    # Numerical
    num_data = df[[c for c in numerical_cols if c in df.columns]].copy()
    for col in num_data.columns:
        num_data[col] = pd.to_numeric(num_data[col], errors="coerce").fillna(0.0)

    # OHE categorical columns
    cat_data = pd.DataFrame(index=df.index)
    for cat in categorical_cols:
        vals = df[cat].fillna("unknown").astype(str) if cat in df.columns \
               else pd.Series(["unknown"] * len(df))
        for val in vals.unique():
            cat_data[f"{cat}_{val}"] = (vals == val).astype(float)

    # Align to training columns
    combined = pd.concat([num_data, cat_data], axis=1)
    combined = combined.reindex(columns=feature_columns, fill_value=0).astype(float)

    X_scaled = scaler.transform(combined)

    svm_preds  = svm_model.predict(X_scaled)           # binary: 0/1
    svm_probas = svm_model.predict_proba(X_scaled)     # [[P(N), P(A)], ...]
    xgb_preds  = xgb_model.predict(X_scaled)           # 5-class index

    return svm_preds, xgb_preds, svm_probas


# ─────────────────────────────────
# CSV Upload Endpoint
# ─────────────────────────────────

@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        raw = pd.read_csv(io.BytesIO(content))

        # Handle headerless NSL-KDD format
        if "protocol_type" not in raw.columns:
            cols_full    = ALL_COLUMNS + ["label", "difficulty"]
            cols_nolabel = ALL_COLUMNS + ["label"]
            if len(raw.columns) == len(cols_full):
                raw.columns = cols_full
                raw.drop(columns=["difficulty"], inplace=True, errors="ignore")
            elif len(raw.columns) == len(cols_nolabel):
                raw.columns = cols_nolabel
            else:
                raw.columns = cols_full[:len(raw.columns)]
                raw.drop(columns=["difficulty"], inplace=True, errors="ignore")

        # Before-validation chart: protocol type distribution
        if "protocol_type" in raw.columns:
            proto_counts = raw["protocol_type"].astype(str).str.lower().value_counts().to_dict()
        else:
            proto_counts = {}
        before_validation_data = [{"name": k, "value": int(v)} for k, v in proto_counts.items()]

        # Fill missing columns
        for col in ALL_COLUMNS:
            if col not in raw.columns:
                raw[col] = "unknown" if col in categorical_cols else 0.0

        df = raw[ALL_COLUMNS].copy()

        # Run SVM + XGBoost on all rows
        svm_preds, xgb_preds, svm_probas = _batch_predict(df)

        predictions      = []
        after_val_counts = {}

        for i in range(len(df)):
            is_attack = int(svm_preds[i]) == 1
            conf      = round(float(max(svm_probas[i])) * 100, 2)

            if not is_attack:
                status      = "Normal Traffic"
                attack_type = "normal"
                category    = "Normal"
                risk_level  = "Low"
            else:
                # XGBoost gives attack category
                cat_idx   = int(xgb_preds[i])
                cat_label = label_encoder.inverse_transform([cat_idx])[0]
                category  = cat_display.get(cat_label, "DoS")
                attack_type = cat_representative.get(cat_label, "neptune")
                risk_level  = get_risk_level(cat_label, conf)
                status      = "Attack Detected"

            after_val_counts[category] = after_val_counts.get(category, 0) + 1
            predictions.append({
                "status":                status,
                "attack_type":           attack_type,
                "attack_category":       category,
                "risk_level":            risk_level,
                "confidence_percentage": conf
            })

        # Metrics
        with open(os.path.join(BASE_DIR, "metrics.json")) as f:
            metrics = json.load(f)

        svm_rf_comparison = [
            {"name": "SVM",     "accuracy": round(metrics.get("svm_accuracy", 0) * 100, 2)},
            {"name": "XGBoost", "accuracy": round(metrics.get("xgb_accuracy", 0) * 100, 2)},
        ]

        cm = np.load(os.path.join(BASE_DIR, "confusion_matrix.npy")).tolist()

        cm_multi_path  = os.path.join(BASE_DIR, "confusion_matrix_multi.npy")
        cm_labels_path = os.path.join(BASE_DIR, "cm_multi_labels.json")
        cm_multi        = np.load(cm_multi_path).tolist() if os.path.exists(cm_multi_path) else []
        if os.path.exists(cm_labels_path):
            with open(cm_labels_path) as _f:
                cm_multi_labels = json.load(_f)
        else:
            cm_multi_labels = ["dos", "normal", "probe", "r2l", "u2r"]

        return {
            "predictions":             predictions,
            "metrics":                 metrics,
            "graph_before_validation": before_validation_data,
            "graph_after_validation":  [{"name": k, "value": v} for k, v in after_val_counts.items()],
            "graph_svm_vs_rf":         svm_rf_comparison,
            "confusion_matrix":        cm,
            "confusion_matrix_multi":  cm_multi,
            "cm_multi_labels":         cm_multi_labels,
        }

    except Exception as e:
        import traceback
        return {"error": str(e), "detail": traceback.format_exc()}