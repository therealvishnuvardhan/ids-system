# ==========================================
# IDS PREDICTION SCRIPT
# ==========================================

import pandas as pd
import joblib
import numpy as np

print("Loading trained models...")

binary_model = joblib.load("binary_model.pkl")
multi_model = joblib.load("multi_model.pkl")

features = [
'duration',
'protocol_type',
'src_bytes',
'dst_bytes',
'count',
'serror_rate'
]

protocol_map = {
'tcp':0,
'udp':1,
'icmp':2
}

df = pd.read_csv("intrusion_dataset.csv")

df['protocol_type'] = df['protocol_type'].map(protocol_map)

df.fillna(0,inplace=True)

X = df[features]

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