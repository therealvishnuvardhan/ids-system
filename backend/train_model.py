import pandas as pd
import joblib
import json
import numpy as np
import sys
import io
import os
from datetime import datetime

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, precision_score, recall_score, f1_score
)
from xgboost import XGBClassifier

# ─── Log capture ────────────────────────────────────────────────────────────────
log = []

def pr(msg=""):
    print(msg)
    log.append(str(msg))

# ──────────────────────────────────────────────────────────────────────────────

pr("=" * 60)
pr("  NSL-KDD IDS  |  SVM (Binary)  +  XGBoost (Multiclass)")
pr(f"  Run Date : {datetime.now().strftime('%Y-%m-%d  %H:%M:%S')}")
pr("=" * 60)

pr("""
EVALUATION STRATEGY
-------------------------------------------------------------
  Train  : Full KDDTrain+  (all 125,973 samples)
  Test   : Full KDDTest+   (all 22,544 samples — unseen)

  SVM    → Binary: Normal vs Attack
  XGBoost → Multiclass: DoS / Probe / R2L / U2R / Normal
-------------------------------------------------------------
""")

# ─────────────────────────────────
# Column names
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

# ─────────────────────────────────
# Load datasets
# ─────────────────────────────────

pr("[1] Loading datasets ...")
train_df = pd.read_csv("KDDTrain+.txt", names=columns)
test_df  = pd.read_csv("KDDTest+.txt",  names=columns)
train_df.drop("difficulty", axis=1, inplace=True)
test_df.drop("difficulty",  axis=1, inplace=True)

train_df["label_cat"] = train_df["label"].map(attack_to_cat).fillna("r2l")
test_df["label_cat"]  = test_df["label"].map(attack_to_cat).fillna("r2l")

pr(f"    KDDTrain+ : {len(train_df):,} samples  (training set)")
pr(f"    KDDTest+  : {len(test_df):,} samples   (full unseen test set)")

# ─────────────────────────────────
# Labels
# ─────────────────────────────────

y_train_bin = (train_df["label"] != "normal").astype(int).values
y_test_bin  = (test_df["label"]  != "normal").astype(int).values

label_enc_cat = LabelEncoder()
label_enc_cat.fit(["dos", "normal", "probe", "r2l", "u2r"])
y_train_5c = label_enc_cat.transform(train_df["label_cat"])
y_test_5c  = label_enc_cat.transform(test_df["label_cat"])

label_enc_fine = LabelEncoder()
label_enc_fine.fit(train_df["label"])

# ─────────────────────────────────
# OneHot Encode (combined for consistency)
# ─────────────────────────────────

pr("\n[2] OneHot Encoding ...")
X_tr_raw = train_df.drop(columns=["label", "label_cat"])
X_te_raw = test_df.drop(columns=["label", "label_cat"])
combined     = pd.concat([X_tr_raw, X_te_raw], axis=0)
combined_ohe = pd.get_dummies(combined, columns=["protocol_type", "service", "flag"])

n = len(X_tr_raw)
X_train_ohe = combined_ohe.iloc[:n].reset_index(drop=True).astype(float)
X_test_ohe  = combined_ohe.iloc[n:].reset_index(drop=True).astype(float)

all_features = list(X_train_ohe.columns)
joblib.dump(all_features, "feature_columns.pkl")
pr(f"    Total features after OHE: {len(all_features)}")

# ─────────────────────────────────
# Scale (fit on TRAIN only)
# ─────────────────────────────────

pr("\n[3] Scaling (fit on KDDTrain+ only) ...")
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train_ohe.values)
X_test_s  = scaler.transform(X_test_ohe.values)
joblib.dump(scaler, "scaler.pkl")

pr(f"    Training samples : {len(X_train_s):,}")
pr(f"    Test samples     : {len(X_test_s):,}  (full KDDTest+)")

# ─────────────────────────────────
# MODEL 1: SVM — Binary (Normal vs Attack)
# ─────────────────────────────────

pr("\n[4] Training MODEL 1: SVM (Binary — Normal vs Attack) ...")
svm_model = SVC(
    kernel="rbf",
    C=10,
    gamma="scale",
    class_weight="balanced",
    probability=True,
    random_state=42
)
svm_model.fit(X_train_s, y_train_bin)

svm_pred = svm_model.predict(X_test_s)
svm_acc  = accuracy_score(y_test_bin, svm_pred)
svm_f1   = f1_score(y_test_bin, svm_pred, average="weighted")
svm_prec = precision_score(y_test_bin, svm_pred, average="weighted")
svm_rec  = recall_score(y_test_bin, svm_pred, average="weighted")

pr(f"\n    SVM Accuracy  : {svm_acc*100:.2f}%")
pr(f"    SVM F1-Score  : {svm_f1*100:.2f}%")
pr(f"    SVM Precision : {svm_prec*100:.2f}%")
pr(f"    SVM Recall    : {svm_rec*100:.2f}%")
pr("")
pr(classification_report(y_test_bin, svm_pred, target_names=["Normal", "Attack"]))

# ─────────────────────────────────
# MODEL 2: XGBoost — 5-class Multiclass
# ─────────────────────────────────

pr("\n[5] Training MODEL 2: XGBoost (5-class — DoS/Probe/R2L/U2R/Normal) ...")

xgb_model = XGBClassifier(
    n_estimators      = 300,
    max_depth         = 6,
    learning_rate     = 0.1,
    subsample         = 0.8,
    colsample_bytree  = 0.8,
    objective         = "multi:softmax",
    num_class         = 5,
    eval_metric       = "mlogloss",
    use_label_encoder = False,
    random_state      = 42,
    n_jobs            = -1,
    tree_method       = "hist"
)
xgb_model.fit(X_train_s, y_train_5c, verbose=False)

xgb_pred = xgb_model.predict(X_test_s)
xgb_acc  = accuracy_score(y_test_5c, xgb_pred)
xgb_f1   = f1_score(y_test_5c, xgb_pred, average="weighted")
xgb_prec = precision_score(y_test_5c, xgb_pred, average="weighted")
xgb_rec  = recall_score(y_test_5c, xgb_pred, average="weighted")

pr(f"\n    XGBoost Accuracy  : {xgb_acc*100:.2f}%")
pr(f"    XGBoost F1-Score  : {xgb_f1*100:.2f}%")
pr(f"    XGBoost Precision : {xgb_prec*100:.2f}%")
pr(f"    XGBoost Recall    : {xgb_rec*100:.2f}%")
pr("")
pr(classification_report(y_test_5c, xgb_pred,
      target_names=label_enc_cat.classes_))

# ─────────────────────────────────
# Confusion Matrices
# ─────────────────────────────────

# SVM Binary CM
cm = confusion_matrix(y_test_bin, svm_pred)
np.save("confusion_matrix.npy", cm)

pr("\n[6] Confusion Matrix (SVM Binary):")
pr(f"    {'':20s}  Predicted Normal  Predicted Attack")
pr(f"    {'Actual Normal':20s}  {cm[0][0]:>15,}  {cm[0][1]:>15,}")
pr(f"    {'Actual Attack':20s}  {cm[1][0]:>15,}  {cm[1][1]:>15,}")
pr(f"\n    True Negatives (TN) : {cm[0][0]:,}")
pr(f"    False Positives (FP): {cm[0][1]:,}  ← Normal flagged as Attack")
pr(f"    False Negatives (FN): {cm[1][0]:,}  ← Attack missed")
pr(f"    True Positives (TP) : {cm[1][1]:,}")

# XGBoost 5-class CM
cm_multi = confusion_matrix(y_test_5c, xgb_pred)
np.save("confusion_matrix_multi.npy", cm_multi)
# Save class labels order so frontend can label axes
with open("cm_multi_labels.json", "w") as f:
    json.dump(list(label_enc_cat.classes_), f)
pr("\n    XGBoost 5-class confusion matrix saved.")

# ─────────────────────────────────
# Save Metrics
# ─────────────────────────────────

metrics = {
    # SVM — Binary
    "svm_accuracy":  float(svm_acc),
    "svm_f1":        float(svm_f1),
    "svm_precision": float(svm_prec),
    "svm_recall":    float(svm_rec),
    # XGBoost — 5-class (also kept under rf_ keys for backwards compat)
    "xgb_accuracy":  float(xgb_acc),
    "xgb_f1":        float(xgb_f1),
    "xgb_precision": float(xgb_prec),
    "xgb_recall":    float(xgb_rec),
    "rf_accuracy":   float(xgb_acc),
    "rf_f1":         float(xgb_f1),
    "rf_recall":     float(xgb_rec),
    "rf_precision":  float(xgb_prec),
    "split":         "Full KDDTrain+ train | Full KDDTest+ test"
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

# ─────────────────────────────────
# Save Models
# ─────────────────────────────────

joblib.dump(svm_model,      "svm_model.pkl")
joblib.dump(xgb_model,      "xgb_model.pkl")
joblib.dump(xgb_model,      "rf_model.pkl")
joblib.dump(label_enc_cat,  "label_encoder.pkl")
joblib.dump(label_enc_fine, "label_encoder_fine.pkl")

pr("\n[7] All models saved:")
pr("    svm_model.pkl  — SVM binary classifier")
pr("    xgb_model.pkl  — XGBoost 5-class categorizer")
pr("    scaler.pkl     — StandardScaler")
pr("    feature_columns.pkl")

# ─────────────────────────────────
# Final Summary
# ─────────────────────────────────

pr(f"\n{'='*60}")
pr("  FINAL RESULTS")
pr(f"{'='*60}")
pr(f"  TRAIN : Full KDDTrain+ ({len(X_train_s):,} samples)")
pr(f"  TEST  : Full KDDTest+  ({len(X_test_s):,} samples — complete unseen set)")
pr(f"")
pr(f"  MODEL 1 — SVM  (Normal vs Attack — Binary)")
pr(f"    Accuracy  : {svm_acc*100:.2f}%")
pr(f"    F1-Score  : {svm_f1*100:.2f}%")
pr(f"    Precision : {svm_prec*100:.2f}%")
pr(f"    Recall    : {svm_rec*100:.2f}%")
pr(f"")
pr(f"  MODEL 2 — XGBoost  (5-class Attack Type)")
pr(f"    Accuracy  : {xgb_acc*100:.2f}%")
pr(f"    F1-Score  : {xgb_f1*100:.2f}%")
pr(f"    Precision : {xgb_prec*100:.2f}%")
pr(f"    Recall    : {xgb_rec*100:.2f}%")
pr(f"{'='*60}")

# ─────────────────────────────────
# Write Text Report
# ─────────────────────────────────

report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_report.txt")
with open(report_path, "w", encoding="utf-8") as rpt:
    rpt.write("\n".join(log))

pr("\n[OK] Report saved -> " + report_path)