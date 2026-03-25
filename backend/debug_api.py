import sys
sys.path.insert(0, r"f:\ids-system\backend")

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

# Import exactly what main.py uses
from ml_model import svm_model, xgb_model, scaler, label_encoder, feature_columns, cat_display, cat_representative

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

def batch_predict(df):
    num_data = df[[c for c in numerical_cols if c in df.columns]].copy()
    for col in num_data.columns:
        num_data[col] = pd.to_numeric(num_data[col], errors="coerce").fillna(0.0)

    cat_data = pd.DataFrame(index=df.index)
    for cat in categorical_cols:
        vals = df[cat].fillna("unknown").astype(str) if cat in df.columns \
               else pd.Series(["unknown"] * len(df))
        for val in vals.unique():
            cat_data[f"{cat}_{val}"] = (vals == val).astype(float)

    combined = pd.concat([num_data, cat_data], axis=1)
    combined = combined.reindex(columns=feature_columns, fill_value=0).astype(float)

    print("Combined shape:", combined.shape)
    print("Non-zero per row:", (combined != 0).sum(axis=1).values)
    print("count col values:", combined["count"].values if "count" in combined.columns else "MISSING")
    print("serror_rate values:", combined["serror_rate"].values if "serror_rate" in combined.columns else "MISSING")

    X_scaled = scaler.transform(combined)
    svm_preds  = svm_model.predict(X_scaled)
    xgb_preds  = xgb_model.predict(X_scaled)
    print("SVM preds:", svm_preds)
    print("XGB preds:", xgb_preds)
    return svm_preds, xgb_preds

# Load KDDTest+ and take 3 neptune + 3 normal rows
cols_with = ALL_COLUMNS + ["label", "difficulty"]
raw = pd.read_csv(r"f:\ids-system\backend\KDDTest+.txt", header=None)
raw.columns = cols_with
raw.drop(columns=["difficulty"], inplace=True)

actual = []
rows = []
for label in ["neptune", "neptune", "neptune", "normal", "normal", "normal"]:
    row = raw[raw["label"] == label].iloc[0]
    actual.append(label)
    rows.append(row)

sample = pd.DataFrame(rows)[ALL_COLUMNS].reset_index(drop=True)
print("Actual:", actual)
print()
batch_predict(sample)
