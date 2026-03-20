# ==========================================
# IDS PREDICTION SCRIPT
# ==========================================

import pandas as pd
import joblib
import numpy as np

print("Loading trained models...")

binary_model = joblib.load("binary_model.pkl")
multi_model = joblib.load("multi_model.pkl")

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

# Use same maps as training for categorical columns
protocol_map = {'tcp':0,'udp':1,'icmp':2}
service_map = {}  # if you trained with LabelEncoder, save mappings; for quick script we fallback
flag_map = {}

df = pd.read_csv("intrusion_dataset.csv")

df.fillna(0, inplace=True)

# Map known categoricals; unknown categories remain unchanged or 0
if 'protocol_type' in df.columns:
    df['protocol_type'] = df['protocol_type'].map(protocol_map).fillna(0)

# If service and flag are strings, provide fallback numeric mapping to avoid errors
if 'service' in df.columns and df['service'].dtype == object:
    df['service'] = df['service'].astype('category').cat.codes
if 'flag' in df.columns and df['flag'].dtype == object:
    df['flag'] = df['flag'].astype('category').cat.codes

for col in selected_features:
    if col not in df.columns:
        df[col] = 0.0

X = df[selected_features]

print("\n==============================")
print(" INTRUSION DETECTION SYSTEM")
print("==============================\n")

for i in range(len(X)):

    row = X.iloc[[i]]

    binary_pred = binary_model.predict(row)[0]

    if binary_pred == 0:

        prob = binary_model.predict_proba(row)[0]
        conf = np.max(prob)*100

        print(f"Row {i}: ✅ Normal Traffic")
        print(f"Confidence : {conf:.2f}%\n")

    else:

        attack = multi_model.predict(row)[0]

        prob = multi_model.predict_proba(row)[0]
        conf = np.max(prob)*100

        print(f"Row {i}: 🚨 Intrusion Detected")
        print(f"Attack Type : {attack}")
        print(f"Confidence : {conf:.2f}%\n")