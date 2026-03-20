import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
rf_model = joblib.load(os.path.join(BASE_DIR, "rf_model.pkl"))
svm_model = joblib.load(os.path.join(BASE_DIR, "svm_model.pkl"))
encoders = joblib.load(os.path.join(BASE_DIR, "encoders.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))

attack_category_map = {

    "neptune": "DoS",
    "smurf": "DoS",
    "back": "DoS",
    "teardrop": "DoS",
    "pod": "DoS",
    "land": "DoS",

    "ipsweep": "Probe",
    "nmap": "Probe",
    "portsweep": "Probe",
    "satan": "Probe",

    "guess_passwd": "R2L",
    "ftp_write": "R2L",
    "imap": "R2L",
    "phf": "R2L",
    "multihop": "R2L",
    "warezclient": "R2L",
    "warezmaster": "R2L",

    "buffer_overflow": "U2R",
    "loadmodule": "U2R",
    "rootkit": "U2R",
    "perl": "U2R",

    "normal": "Normal"
}

def get_risk_level(category, confidence):

    if category == "Normal":
        return "Low"

    if confidence > 90:
        return "High"

    elif confidence > 70:
        return "Medium"

    else:
        return "Low"


def predict_network(data_dict):
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

    df = pd.DataFrame([data_dict])

    # fill missing expected features with zeros
    for f in selected_features:
        if f not in df.columns:
            df[f] = 0.0

    # Only keep expected order
    df = df[selected_features]

    # encode categories
    for col in ["protocol_type", "service", "flag"]:
        if col in df.columns and col in encoders:
            try:
                df[col] = encoders[col].transform(df[col].astype(str))
            except ValueError:
                df[col] = 0.0
        else:
            df[col] = 0.0

    svm_pred = svm_model.predict(df)

    # If SVM says normal
    if svm_pred[0] == 0:
        return {
            "status": "Normal Traffic",
            "attack_type": "normal",
            "attack_category": "Normal",
            "risk_level": "Low",
            "confidence_percentage": 100
        }

    rf_pred = rf_model.predict(df)
    rf_probs = rf_model.predict_proba(df)
    rf_conf = float(max(rf_probs[0]))

    attack_type = label_encoder.inverse_transform([rf_pred[0]])[0]
    category = attack_category_map.get(attack_type, "Unknown")
    risk_level = get_risk_level(category, round(rf_conf * 100, 2))

    return {
        "status": "Attack Detected",
        "attack_type": attack_type,
        "attack_category": category,
        "risk_level": risk_level,
        "confidence_percentage": round(rf_conf * 100, 2)
    }