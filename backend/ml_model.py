import joblib  # reloaded: 2026-03-25
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load both models
svm_model       = joblib.load(os.path.join(BASE_DIR, "svm_model.pkl"))
xgb_model       = joblib.load(os.path.join(BASE_DIR, "xgb_model.pkl"))
label_encoder   = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))   # 5-class
scaler          = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
feature_columns = joblib.load(os.path.join(BASE_DIR, "feature_columns.pkl"))

# Category display names
cat_display = {
    "dos":   "DoS",
    "probe": "Probe",
    "r2l":   "R2L",
    "u2r":   "U2R",
    "normal":"Normal"
}

# Representative attack per category (for display)
cat_representative = {
    "dos":   "neptune",
    "probe": "ipsweep",
    "r2l":   "guess_passwd",
    "u2r":   "buffer_overflow",
}

attack_category_map = cat_display   # used by main.py


def get_risk_level(category: str, confidence: float) -> str:
    if category in ("Normal", "normal"):
        return "Low"
    if confidence > 90:
        return "High"
    elif confidence > 70:
        return "Medium"
    return "Low"


def _build_row(data_dict: dict) -> pd.DataFrame:
    """Build an OHE-aligned single-row DataFrame for inference."""
    categorical_cols = ["protocol_type", "service", "flag"]
    numerical_features = [
        "duration","src_bytes","dst_bytes","land","wrong_fragment","urgent","hot",
        "num_failed_logins","logged_in","num_compromised","root_shell","su_attempted",
        "num_root","num_file_creations","num_shells","num_access_files",
        "num_outbound_cmds","is_host_login","is_guest_login",
        "count","srv_count","serror_rate","srv_serror_rate","rerror_rate",
        "srv_rerror_rate","same_srv_rate","diff_srv_rate","srv_diff_host_rate",
        "dst_host_count","dst_host_srv_count","dst_host_same_srv_rate",
        "dst_host_diff_srv_rate","dst_host_same_src_port_rate",
        "dst_host_srv_diff_host_rate","dst_host_serror_rate",
        "dst_host_srv_serror_rate","dst_host_rerror_rate","dst_host_srv_rerror_rate"
    ]

    row = {}
    for col in numerical_features:
        row[col] = float(data_dict.get(col, 0.0))
    for cat in categorical_cols:
        val = str(data_dict.get(cat, "unknown"))   # no .lower() — match training case
        row[f"{cat}_{val}"] = 1.0

    df = pd.DataFrame([row])
    df = df.reindex(columns=feature_columns, fill_value=0).astype(float)
    return df


def predict_network(data_dict: dict) -> dict:
    """
    Two-model pipeline:
      SVM  → binary: Normal vs Attack
      XGBoost → 5-class: dos / probe / r2l / u2r / normal
    """
    df        = _build_row(data_dict)
    df_scaled = scaler.transform(df)

    # Stage 1: SVM binary
    svm_pred  = int(svm_model.predict(df_scaled)[0])
    svm_proba = svm_model.predict_proba(df_scaled)[0]
    svm_conf  = round(float(max(svm_proba)) * 100, 2)

    if svm_pred == 0:
        return {
            "status":                "Normal Traffic",
            "attack_type":           "normal",
            "attack_category":       "Normal",
            "risk_level":            "Low",
            "confidence_percentage": svm_conf
        }

    # Stage 2: XGBoost 5-class categorizer
    xgb_pred    = int(xgb_model.predict(df_scaled)[0])
    cat_label   = label_encoder.inverse_transform([xgb_pred])[0]   # dos/probe/r2l/u2r/normal
    cat_display_name = cat_display.get(cat_label, "DoS")
    attack_type = cat_representative.get(cat_label, "neptune")
    risk_level  = get_risk_level(cat_label, svm_conf)

    return {
        "status":                "Attack Detected",
        "attack_type":           attack_type,
        "attack_category":       cat_display_name,
        "risk_level":            risk_level,
        "confidence_percentage": svm_conf
    }