from fastapi import FastAPI, UploadFile, File
import pandas as pd
import joblib
import numpy as np
import json
import os

from fastapi.middleware.cors import CORSMiddleware
from ml_model import (
    predict_network,
    attack_category_map,
    get_risk_level,
    _build_ohe_row,
    scaler,
    xgb_model,
    rf_model,
    svm_model,
    label_encoder,
    feature_columns,
    category_display,
    category_representative,
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

# -------------------------
# CSV Upload API
# -------------------------

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
    "dst_host_srv_serror_rate","dst_host_rerror_rate",
    "dst_host_srv_rerror_rate"
]

categorical_cols  = ["protocol_type", "service", "flag"]
numerical_cols    = [c for c in ALL_COLUMNS if c not in categorical_cols]

LOG_COLS = [
    "src_bytes","dst_bytes","duration",
    "num_compromised","num_root","count","srv_count",
    "dst_host_count","dst_host_srv_count"
]


def _batch_predict(df: pd.DataFrame):
    """
    Run the full OHE + scale + ensemble pipeline on an entire DataFrame at once.
    Returns (svm_preds, xgb_binary_preds, xgb_cat_preds, xgb_cat_probas, ensemble_probas)
    """
    # -- Build OHE rows in bulk --

    # Numerical columns
    num_feats = [c for c in numerical_cols if c in df.columns]
    num_data = df[num_feats].copy()
    for col in num_feats:
        num_data[col] = pd.to_numeric(num_data[col], errors="coerce").fillna(0.0)

    # Log-transforms
    for col in LOG_COLS:
        if col in num_data.columns:
            num_data[f"{col}_log"] = np.log1p(num_data[col])

    # OHE categorical columns
    cat_data = pd.DataFrame(index=df.index)
    for cat in categorical_cols:
        col_vals = df[cat].fillna("unknown").astype(str).str.lower() if cat in df.columns else "unknown"
        for val in col_vals.unique():
            col_name = f"{cat}_{val}"
            cat_data[col_name] = (col_vals == val).astype(float)

    # Merge and align to training feature columns
    combined = pd.concat([num_data, cat_data], axis=1)
    combined = combined.reindex(columns=feature_columns, fill_value=0).astype(float)

    # Scale
    X_scaled = scaler.transform(combined)

    # SVM binary predictions
    svm_proba  = svm_model.predict_proba(X_scaled)[:, 1]    # P(attack)
    svm_preds  = (svm_proba >= 0.5).astype(int)

    # XGBoost binary predictions
    xgb_proba  = xgb_model.predict_proba(X_scaled)[:, 1]    # P(attack)
    xgb_preds  = (xgb_proba >= 0.5).astype(int)

    # Soft-voting ensemble (40% SVM + 60% XGBoost)
    ensemble_proba = 0.4 * svm_proba + 0.6 * xgb_proba

    # XGBoost 5-class categorizer
    xgb_cat_preds  = rf_model.predict(X_scaled)
    xgb_cat_probas = rf_model.predict_proba(X_scaled)

    return ensemble_proba, svm_preds, xgb_preds, xgb_cat_preds, xgb_cat_probas


@app.post("/upload_csv")
async def upload_csv(file: UploadFile = File(...)):

    try:
        content = await file.read()
        import io

        # Try reading as headed CSV; if protocol_type column missing → treat as NSL-KDD headerless
        raw = pd.read_csv(io.BytesIO(content))

        if "protocol_type" not in raw.columns:
            # Headerless NSL-KDD format (42 or 43 cols)
            cols_with_label    = ALL_COLUMNS + ["label", "difficulty"]
            cols_without_label = ALL_COLUMNS + ["label"]
            if len(raw.columns) == len(cols_with_label):
                raw.columns = cols_with_label
                raw.drop(columns=["difficulty"], inplace=True, errors="ignore")
            elif len(raw.columns) == len(cols_without_label):
                raw.columns = cols_without_label
            else:
                raw.columns = (ALL_COLUMNS + ["label", "difficulty"])[:len(raw.columns)]
                raw.drop(columns=["difficulty"], inplace=True, errors="ignore")

        # Before-validation chart: protocol_type distribution
        if "protocol_type" in raw.columns:
            proto_counts = raw["protocol_type"].astype(str).str.lower().value_counts().to_dict()
        else:
            proto_counts = {}
        before_validation_data = [{"name": k, "value": int(v)} for k, v in proto_counts.items()]

        # Fill missing columns with safe defaults
        for col in ALL_COLUMNS:
            if col not in raw.columns:
                raw[col] = "unknown" if col in categorical_cols else 0.0

        df = raw[ALL_COLUMNS].copy()

        # ------ Run batch prediction ------
        ensemble_proba, svm_preds, xgb_preds, cat_preds, cat_probas = _batch_predict(df)

        predictions    = []
        after_val_counts = {}

        for i in range(len(df)):
            is_attack = ensemble_proba[i] >= 0.5

            if not is_attack:
                confidence   = round(float(1.0 - ensemble_proba[i]) * 100, 2)
                status       = "Normal Traffic"
                attack_type  = "normal"
                category     = "Normal"
                risk_level   = "Low"
            else:
                cat_enc    = int(cat_preds[i])
                cat_conf   = round(float(max(cat_probas[i])) * 100, 2)
                cat_label  = label_encoder.inverse_transform([cat_enc])[0]   # "dos", "probe"…
                category   = category_display.get(cat_label, cat_label.upper())
                attack_type = category_representative.get(cat_label, cat_label)
                risk_level  = get_risk_level(category, cat_conf)
                confidence  = cat_conf
                status      = "Attack Detected"

            after_val_counts[category] = after_val_counts.get(category, 0) + 1

            predictions.append({
                "status":                status,
                "attack_type":           attack_type,
                "attack_category":       category,
                "risk_level":            risk_level,
                "confidence_percentage": confidence
            })

        # ------ Metrics & confusion matrix ------
        with open(os.path.join(BASE_DIR, "metrics.json")) as f:
            metrics = json.load(f)

        svm_rf_comparison = [
            {"name": "SVM",          "accuracy": round(metrics.get("svm_accuracy", 0) * 100, 2)},
            {"name": "XGBoost",      "accuracy": round(metrics.get("xgb_accuracy", 0) * 100, 2)},
            {"name": "Ensemble",     "accuracy": round(metrics.get("ensemble_accuracy", 0) * 100, 2)},
        ]

        cm = np.load(os.path.join(BASE_DIR, "confusion_matrix.npy")).tolist()

        return {
            "predictions":           predictions,
            "metrics":               metrics,
            "graph_before_validation": before_validation_data,
            "graph_after_validation":  [{"name": k, "value": v} for k, v in after_val_counts.items()],
            "graph_svm_vs_rf":       svm_rf_comparison,
            "confusion_matrix":      cm
        }

    except Exception as e:
        import traceback
        return {"error": str(e), "detail": traceback.format_exc()}