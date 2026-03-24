import joblib
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load models & artifacts
xgb_model          = joblib.load(os.path.join(BASE_DIR, "xgb_model.pkl"))   # binary XGBoost
rf_model            = joblib.load(os.path.join(BASE_DIR, "rf_model.pkl"))    # 5-class XGBoost categorizer
svm_model           = joblib.load(os.path.join(BASE_DIR, "svm_model.pkl"))
label_encoder       = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))      # 5-class
label_encoder_fine  = joblib.load(os.path.join(BASE_DIR, "label_encoder_fine.pkl")) # fine-grained
scaler              = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
feature_columns     = joblib.load(os.path.join(BASE_DIR, "feature_columns.pkl"))

# Category display names
category_display = {
    "normal": "Normal",
    "dos":    "DoS",
    "probe":  "Probe",
    "r2l":    "R2L",
    "u2r":    "U2R",
}

# Representative attack type per category
category_representative = {
    "dos":   "neptune",
    "probe": "ipsweep",
    "r2l":   "guess_passwd",
    "u2r":   "buffer_overflow",
}

attack_category_map = {
    "neptune": "DoS", "smurf": "DoS", "back": "DoS", "teardrop": "DoS",
    "pod": "DoS", "land": "DoS", "apache2": "DoS", "udpstorm": "DoS",
    "processtable": "DoS", "mailbomb": "DoS", "worm": "DoS",
    "ipsweep": "Probe", "nmap": "Probe", "portsweep": "Probe",
    "satan": "Probe", "saint": "Probe", "mscan": "Probe",
    "guess_passwd": "R2L", "ftp_write": "R2L", "imap": "R2L",
    "phf": "R2L", "multihop": "R2L", "warezclient": "R2L",
    "warezmaster": "R2L", "sendmail": "R2L", "named": "R2L",
    "snmpgetattack": "R2L", "snmpguess": "R2L", "xlock": "R2L",
    "xsnoop": "R2L", "httptunnel": "R2L", "spy": "R2L",
    "buffer_overflow": "U2R", "loadmodule": "U2R", "rootkit": "U2R",
    "perl": "U2R", "sqlattack": "U2R", "xterm": "U2R", "ps": "U2R",
    "normal": "Normal"
}


def get_risk_level(category: str, confidence: float) -> str:
    if category == "Normal":
        return "Low"
    if confidence > 90:
        return "High"
    elif confidence > 70:
        return "Medium"
    return "Low"


def _build_ohe_row(data_dict: dict) -> pd.DataFrame:
    """
    Build an OHE-aligned feature row for inference.
    Applies the same log-transforms used during training.
    """
    categorical_cols = ["protocol_type", "service", "flag"]
    numerical_features = [
        "duration", "src_bytes", "dst_bytes",
        "wrong_fragment", "num_compromised", "num_root", "count", "srv_count",
        "serror_rate", "srv_serror_rate", "same_srv_rate", "diff_srv_rate",
        "dst_host_count", "dst_host_srv_count", "dst_host_same_srv_rate",
        "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
        "dst_host_srv_diff_host_rate", "dst_host_serror_rate",
        "dst_host_srv_serror_rate", "dst_host_rerror_rate",
        "dst_host_srv_rerror_rate"
    ]
    log_cols = [
        "src_bytes", "dst_bytes", "duration",
        "num_compromised", "num_root", "count", "srv_count",
        "dst_host_count", "dst_host_srv_count"
    ]

    row = {}

    # Numerical
    raw_vals = {}
    for col in numerical_features:
        val = float(data_dict.get(col, 0.0))
        row[col] = val
        raw_vals[col] = val

    # Log-transforms
    for col in log_cols:
        row[f"{col}_log"] = float(np.log1p(raw_vals.get(col, 0.0)))

    # OHE categorical columns
    for cat in categorical_cols:
        val = str(data_dict.get(cat, "unknown")).lower()
        row[f"{cat}_{val}"] = 1.0

    df = pd.DataFrame([row])
    df = df.reindex(columns=feature_columns, fill_value=0).astype(float)
    return df


def predict_network(data_dict: dict) -> dict:
    """
    Two-stage ensemble pipeline:
      Stage 1 — Ensemble (SVM + XGBoost binary): Normal vs Attack
      Stage 2 — XGBoost 5-class: attack category if Stage 1 → Attack
    """
    df = _build_ohe_row(data_dict)
    df_scaled = scaler.transform(df)

    # Stage 1: Soft-vote ensemble (40% SVM + 60% XGBoost)
    svm_proba = svm_model.predict_proba(df_scaled)[0][1]     # P(attack)
    xgb_proba = xgb_model.predict_proba(df_scaled)[0][1]     # P(attack)

    ensemble_proba = 0.4 * svm_proba + 0.6 * xgb_proba
    is_attack = ensemble_proba >= 0.5

    if not is_attack:
        confidence = round(float(1.0 - ensemble_proba) * 100, 2)
        return {
            "status": "Normal Traffic",
            "attack_type": "normal",
            "attack_category": "Normal",
            "risk_level": "Low",
            "confidence_percentage": confidence
        }

    # Stage 2: XGBoost 5-class categorizer
    cat_pred_enc = int(rf_model.predict(df_scaled)[0])
    cat_proba    = rf_model.predict_proba(df_scaled)[0]
    cat_conf     = round(float(max(cat_proba)) * 100, 2)

    cat_label   = label_encoder.inverse_transform([cat_pred_enc])[0]
    cat_display = category_display.get(cat_label, cat_label.upper())
    attack_type = category_representative.get(cat_label, cat_label)
    risk_level  = get_risk_level(cat_display, cat_conf)

    return {
        "status": "Attack Detected",
        "attack_type": attack_type,
        "attack_category": cat_display,
        "risk_level": risk_level,
        "confidence_percentage": cat_conf
    }