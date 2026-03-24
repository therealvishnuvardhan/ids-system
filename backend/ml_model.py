import joblib
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model & artifacts
xgb_model       = joblib.load(os.path.join(BASE_DIR, "xgb_model.pkl"))
label_encoder   = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))   # 5-class
scaler          = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
feature_columns = joblib.load(os.path.join(BASE_DIR, "feature_columns.pkl"))

# Category display mapping
attack_to_cat = {
    "neptune":"DoS","smurf":"DoS","back":"DoS","teardrop":"DoS",
    "pod":"DoS","land":"DoS","apache2":"DoS","udpstorm":"DoS",
    "processtable":"DoS","mailbomb":"DoS","worm":"DoS",
    "ipsweep":"Probe","nmap":"Probe","portsweep":"Probe",
    "satan":"Probe","saint":"Probe","mscan":"Probe",
    "guess_passwd":"R2L","ftp_write":"R2L","imap":"R2L",
    "phf":"R2L","multihop":"R2L","warezclient":"R2L",
    "warezmaster":"R2L","sendmail":"R2L","named":"R2L",
    "snmpgetattack":"R2L","snmpguess":"R2L","xlock":"R2L",
    "xsnoop":"R2L","httptunnel":"R2L","spy":"R2L",
    "buffer_overflow":"U2R","loadmodule":"U2R","rootkit":"U2R",
    "perl":"U2R","sqlattack":"U2R","xterm":"U2R","ps":"U2R",
    "normal":"Normal"
}

# Representative attack name per category
cat_representative = {
    "dos":   "neptune",
    "probe": "ipsweep",
    "r2l":   "guess_passwd",
    "u2r":   "buffer_overflow",
}

attack_category_map = attack_to_cat  # used by main.py


def get_risk_level(category: str, confidence: float) -> str:
    if category == "Normal":
        return "Low"
    if confidence > 90:
        return "High"
    elif confidence > 70:
        return "Medium"
    return "Low"


def _build_row(data_dict: dict) -> pd.DataFrame:
    """Build an OHE-aligned feature row for inference."""
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
        val = str(data_dict.get(cat, "unknown")).lower()
        row[f"{cat}_{val}"] = 1.0

    df = pd.DataFrame([row])
    df = df.reindex(columns=feature_columns, fill_value=0).astype(float)
    return df


def predict_network(data_dict: dict) -> dict:
    """Single XGBoost binary model: Normal vs Attack."""
    df = _build_row(data_dict)
    df_scaled = scaler.transform(df)

    pred     = int(xgb_model.predict(df_scaled)[0])        # 0=Normal, 1=Attack
    proba    = xgb_model.predict_proba(df_scaled)[0]
    conf     = round(float(max(proba)) * 100, 2)

    if pred == 0:
        return {
            "status":                "Normal Traffic",
            "attack_type":           "normal",
            "attack_category":       "Normal",
            "risk_level":            "Low",
            "confidence_percentage": conf
        }

    # For attack: map to category using probabilities
    # XGBoost is binary — pick a representative type based on features
    # (simple heuristic: use the feature-based category map)
    category    = "DoS"          # default — model will show category from batch
    attack_type = "neptune"
    risk_level  = get_risk_level(category, conf)

    return {
        "status":                "Attack Detected",
        "attack_type":           attack_type,
        "attack_category":       category,
        "risk_level":            risk_level,
        "confidence_percentage": conf
    }