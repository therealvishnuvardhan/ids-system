import joblib
import pandas as pd

rf_model = joblib.load("rf_model.pkl")
svm_model = joblib.load("svm_model.pkl")
xgb_model = joblib.load("xgb_model.pkl")
encoders = joblib.load("encoders.pkl")
label_encoder = joblib.load("label_encoder.pkl")

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

    df = pd.DataFrame([data_dict])

    for col in ["protocol_type", "service", "flag"]:

        try:
            df[col] = encoders[col].transform(df[col])

        except ValueError:

            return {
                "error": f"Unknown value for '{col}'"
            }

    # Add missing zero features since we expanded the feature set in train_model
    # but the frontend still might only send the basic 6.
    # To handle arbitrary CSV files that DO have all 25 features, we should just ensure
    # the DataFrame has the exact shape expected by the models.
    expected_features = [
        "duration", "protocol_type", "service", "flag", "src_bytes", "dst_bytes",
        "wrong_fragment", "num_compromised", "num_root", "count", "srv_count",
        "serror_rate", "srv_serror_rate", "same_srv_rate", "diff_srv_rate",
        "dst_host_count", "dst_host_srv_count", "dst_host_same_srv_rate",
        "dst_host_diff_srv_rate", "dst_host_same_src_port_rate",
        "dst_host_srv_diff_host_rate", "dst_host_serror_rate",
        "dst_host_srv_serror_rate", "dst_host_rerror_rate", "dst_host_srv_rerror_rate"
    ]
    
    for f in expected_features:
        if f not in df.columns:
            df[f] = 0.0

    df = df[expected_features]

    # -------- Stage 1 (SVM) --------

    svm_pred = svm_model.predict(df)

    if svm_pred[0] == 0:

        return {
            "status": "Normal Traffic",
            "attack_type": "normal",
            "attack_category": "Normal",
            "risk_level": "Low",
            "confidence_percentage": 100
        }

    # -------- Stage 2 (Random Forest + XGBoost) --------

    rf_pred = rf_model.predict(df)
    rf_probs = rf_model.predict_proba(df)
    
    xgb_pred = xgb_model.predict(df)
    xgb_probs = xgb_model.predict_proba(df)

    # Simple ensamble: pick the one with the higher max confidence probability
    rf_conf = float(max(rf_probs[0]))
    xgb_conf = float(max(xgb_probs[0]))

    if xgb_conf > rf_conf:
        prediction = xgb_pred
        confidence = round(xgb_conf * 100, 2)
    else:
        prediction = rf_pred
        confidence = round(rf_conf * 100, 2)

    attack_type = label_encoder.inverse_transform(prediction)[0]

    category = attack_category_map.get(attack_type, "Unknown")

    risk_level = get_risk_level(category, confidence)

    return {
        "status": "Attack Detected",
        "attack_type": attack_type,
        "attack_category": category,
        "risk_level": risk_level,
        "confidence_percentage": confidence
    }