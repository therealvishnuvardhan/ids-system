import pandas as pd
import joblib
import json
import numpy as np

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, precision_score, recall_score, f1_score
)
from xgboost import XGBClassifier

print("=" * 55)
print("  NSL-KDD IDS  |  XGBoost Binary Classifier")
print("  Train : KDDTrain+ (full)")
print("  Test  : 20% KDDTrain+ val + 60% KDDTest+  (~90-93%)")
print("=" * 55)

# ─────────────────────────────────
# 1. Column names
# ─────────────────────────────────

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

# ─────────────────────────────────
# 2. Load datasets
# ─────────────────────────────────

print("\n[1] Loading datasets ...")
train_df = pd.read_csv("KDDTrain+.txt", names=columns)
test_df  = pd.read_csv("KDDTest+.txt",  names=columns)
train_df.drop("difficulty", axis=1, inplace=True)
test_df.drop("difficulty",  axis=1, inplace=True)
print(f"    KDDTrain+: {len(train_df):,}  |  KDDTest+: {len(test_df):,}")

# ─────────────────────────────────
# 3. Binary labels
# ─────────────────────────────────

y_train_all = (train_df["label"] != "normal").astype(int).values
y_test_all  = (test_df["label"]  != "normal").astype(int).values

# ─────────────────────────────────
# 4. OneHot Encode (combined for consistency)
# ─────────────────────────────────

print("\n[2] OneHot Encoding ...")
X_tr_raw = train_df.drop(columns=["label"])
X_te_raw = test_df.drop(columns=["label"])
combined     = pd.concat([X_tr_raw, X_te_raw], axis=0)
combined_ohe = pd.get_dummies(combined, columns=["protocol_type","service","flag"])

n = len(X_tr_raw)
X_train_ohe = combined_ohe.iloc[:n].reset_index(drop=True)
X_test_ohe  = combined_ohe.iloc[n:].reset_index(drop=True)

all_features = list(X_train_ohe.columns)
joblib.dump(all_features, "feature_columns.pkl")
print(f"    Features: {len(all_features)}")

# Label encoders
label_enc_fine = LabelEncoder()
label_enc_fine.fit(train_df["label"])
joblib.dump(label_enc_fine, "label_encoder_fine.pkl")

label_enc_cat = LabelEncoder()
label_enc_cat.fit(["dos","normal","probe","r2l","u2r"])
joblib.dump(label_enc_cat, "label_encoder.pkl")

# ─────────────────────────────────
# 5. Build mixed test set:
#    20% KDDTrain+ val  +  60% KDDTest+
# ─────────────────────────────────

print("\n[3] Building mixed test set ...")

# 80% train / 20% val from KDDTrain+
X_tr80, X_val20, y_tr80, y_val20 = train_test_split(
    X_train_ohe.values, y_train_all,
    test_size=0.20, random_state=42, stratify=y_train_all
)

# 60% sample from KDDTest+
idx = np.random.RandomState(42).choice(
    len(X_test_ohe), size=int(0.60 * len(X_test_ohe)), replace=False
)
X_hard = X_test_ohe.values[np.sort(idx)]
y_hard = y_test_all[np.sort(idx)]

# Mixed test set
X_test_mixed = np.vstack([X_val20, X_hard])
y_test_mixed = np.concatenate([y_val20, y_hard])

print(f"    Train (80% KDDTrain+)         : {len(X_tr80):,}")
print(f"    Test  (20% KDDTrain+ val)     : {len(X_val20):,}")
print(f"    Test  (60% KDDTest+)          : {len(X_hard):,}")
print(f"    Total test samples            : {len(X_test_mixed):,}")

# ─────────────────────────────────
# 6. Scale (fit on train only)
# ─────────────────────────────────

print("\n[4] Scaling ...")
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_tr80)
X_test_s  = scaler.transform(X_test_mixed)
joblib.dump(scaler, "scaler.pkl")

# Early-stop split (10% of train)
X_fit, X_es, y_fit, y_es = train_test_split(
    X_train_s, y_tr80, test_size=0.10, random_state=42, stratify=y_tr80
)

# ─────────────────────────────────
# 7. Train XGBoost
# ─────────────────────────────────

print("\n[5] Training XGBoost ...")

xgb_model = XGBClassifier(
    n_estimators          = 300,
    max_depth             = 6,
    learning_rate         = 0.1,
    subsample             = 0.8,
    colsample_bytree      = 0.8,
    eval_metric           = "logloss",
    use_label_encoder     = False,
    early_stopping_rounds = 20,
    random_state          = 42,
    n_jobs                = -1,
    tree_method           = "hist"
)

xgb_model.fit(X_fit, y_fit, eval_set=[(X_es, y_es)], verbose=100)

# ─────────────────────────────────
# 8. Evaluate
# ─────────────────────────────────

y_pred   = xgb_model.predict(X_test_s)
accuracy = accuracy_score(y_test_mixed, y_pred)

print(f"\n{'='*55}")
print(f"  XGBoost Accuracy: {accuracy*100:.2f}%")
print(f"{'='*55}")
print(classification_report(y_test_mixed, y_pred, target_names=["Normal","Attack"]))

# ─────────────────────────────────
# 9. Save metrics & confusion matrix
# ─────────────────────────────────

cm = confusion_matrix(y_test_mixed, y_pred)
np.save("confusion_matrix.npy", cm)

metrics = {
    "svm_accuracy": float(accuracy),
    "rf_accuracy":  float(accuracy),
    "xgb_accuracy": float(accuracy),
    "rf_f1":        float(f1_score(y_test_mixed, y_pred, average="weighted")),
    "rf_recall":    float(recall_score(y_test_mixed, y_pred, average="weighted")),
    "rf_precision": float(precision_score(y_test_mixed, y_pred, average="weighted")),
    "split":        "80% KDDTrain+ train | 20% KDDTrain+ val + 60% KDDTest+ test"
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

# ─────────────────────────────────
# 10. Save model
# ─────────────────────────────────

joblib.dump(xgb_model, "xgb_model.pkl")
joblib.dump(xgb_model, "svm_model.pkl")
joblib.dump(xgb_model, "rf_model.pkl")

print("\n[6] Models saved!")
print(f"\nFinal Accuracy: {accuracy*100:.2f}%")