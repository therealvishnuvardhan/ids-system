"""
Quick script: loads existing svm/xgb models and KDDTest+,
then computes & saves the 5-class XGBoost confusion matrix.
Run once:  python gen_multi_cm.py
"""

import pandas as pd, numpy as np, joblib, json, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

columns = [
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
    "dst_host_srv_rerror_rate","label","difficulty"
]

attack_to_cat = {
    "neptune":"dos","smurf":"dos","back":"dos","teardrop":"dos",
    "pod":"dos","land":"dos","apache2":"dos","udpstorm":"dos",
    "processtable":"dos","mailbomb":"dos","worm":"dos",
    "ipsweep":"probe","nmap":"probe","portsweep":"probe",
    "satan":"probe","saint":"probe","mscan":"probe",
    "guess_passwd":"r2l","ftp_write":"r2l","imap":"r2l",
    "phf":"r2l","multihop":"r2l","warezclient":"r2l",
    "warezmaster":"r2l","sendmail":"r2l","named":"r2l",
    "snmpgetattack":"r2l","snmpguess":"r2l","xlock":"r2l",
    "xsnoop":"r2l","httptunnel":"r2l","spy":"r2l",
    "buffer_overflow":"u2r","loadmodule":"u2r","rootkit":"u2r",
    "perl":"u2r","sqlattack":"u2r","xterm":"u2r","ps":"u2r",
    "normal":"normal"
}

print("Loading KDDTest+...")
test_df = pd.read_csv(os.path.join(BASE_DIR, "KDDTest+.txt"), names=columns)
test_df.drop("difficulty", axis=1, inplace=True)
test_df["label_cat"] = test_df["label"].map(attack_to_cat).fillna("r2l")

label_encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))
feature_columns = joblib.load(os.path.join(BASE_DIR, "feature_columns.pkl"))
scaler  = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
xgb     = joblib.load(os.path.join(BASE_DIR, "xgb_model.pkl"))

y_true = label_encoder.transform(test_df["label_cat"])

# Build OHE features matching training
categorical_cols = ["protocol_type", "service", "flag"]
numerical_cols   = [c for c in columns[:-2] if c not in categorical_cols]

num_data = test_df[[c for c in numerical_cols if c in test_df.columns]].copy()
for col in num_data.columns:
    num_data[col] = pd.to_numeric(num_data[col], errors="coerce").fillna(0.0)

cat_data = pd.DataFrame(index=test_df.index)
for cat in categorical_cols:
    vals = test_df[cat].fillna("unknown").astype(str)
    for val in vals.unique():
        cat_data[f"{cat}_{val}"] = (vals == val).astype(float)

combined = pd.concat([num_data, cat_data], axis=1)
combined = combined.reindex(columns=feature_columns, fill_value=0).astype(float)
X = scaler.transform(combined)

print("Running XGBoost predict...")
y_pred = xgb.predict(X)

from sklearn.metrics import confusion_matrix
cm_multi = confusion_matrix(y_true, y_pred)

np.save(os.path.join(BASE_DIR, "confusion_matrix_multi.npy"), cm_multi)
with open(os.path.join(BASE_DIR, "cm_multi_labels.json"), "w") as f:
    json.dump(list(label_encoder.classes_), f)

print("Saved confusion_matrix_multi.npy and cm_multi_labels.json")
print("Labels:", label_encoder.classes_)
print("CM shape:", cm_multi.shape)
print(cm_multi)
