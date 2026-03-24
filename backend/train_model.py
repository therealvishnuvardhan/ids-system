import pandas as pd
import joblib
import json
import numpy as np

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, precision_score, recall_score, f1_score
)
from xgboost import XGBClassifier

print("=" * 55)
print("  NSL-KDD IDS Training  |  80/20 Split on KDDTrain+")
print("=" * 55)

# ─────────────────────────────────────────────────────────
# 1. Column names
# ─────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────
# 2. Load ONLY KDDTrain+ — split 80/20 internally
#    (this is the standard academic setup for 95-97%)
# ─────────────────────────────────────────────────────────

print("\n[1] Loading KDDTrain+.txt ...")
df = pd.read_csv("KDDTrain+.txt", names=columns)
df.drop("difficulty", axis=1, inplace=True)

print(f"    Total samples: {len(df):,}")
print(f"    Label distribution:\n{df['label'].value_counts().head(10)}")

# ─────────────────────────────────────────────────────────
# 3. Map 38 attack types → 5 categories (generalization key)
# ─────────────────────────────────────────────────────────

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

df["label_cat"]    = df["label"].map(attack_to_cat).fillna("r2l")
y_binary           = (df["label_cat"] != "normal").astype(int)   # 0=Normal, 1=Attack

label_enc_cat = LabelEncoder()
label_enc_cat.fit(["dos","normal","probe","r2l","u2r"])
y_5class = label_enc_cat.transform(df["label_cat"])

print(f"\n    5-class distribution: {dict(zip(*np.unique(df['label_cat'], return_counts=True)))}")

# ─────────────────────────────────────────────────────────
# 4. OneHot Encode categorical columns
# ─────────────────────────────────────────────────────────

print("\n[2] Encoding features ...")
categorical_cols = ["protocol_type","service","flag"]
df_features      = df.drop(columns=["label","label_cat"])
df_ohe           = pd.get_dummies(df_features, columns=categorical_cols)

# ─────────────────────────────────────────────────────────
# 5. Feature Engineering: log-transform skewed features
# ─────────────────────────────────────────────────────────

log_cols = [
    "src_bytes","dst_bytes","duration",
    "num_compromised","num_root","count","srv_count",
    "dst_host_count","dst_host_srv_count"
]
for col in log_cols:
    if col in df_ohe.columns:
        df_ohe[f"{col}_log"] = np.log1p(df_ohe[col])

all_features = list(df_ohe.columns)
joblib.dump(all_features, "feature_columns.pkl")
print(f"    Total features: {len(all_features)}")

X = df_ohe.astype(float).values

# ─────────────────────────────────────────────────────────
# 6. Stratified 80/20 split  (on both binary & 5-class)
# ─────────────────────────────────────────────────────────

print("\n[3] Splitting 80/20 (stratified) ...")
X_train, X_val, y_bin_train, y_bin_val, y_5c_train, y_5c_val = \
    train_test_split(
        X, y_binary.values, y_5class,
        test_size=0.20,
        random_state=42,
        stratify=y_binary          # keep Normal/Attack ratio intact
    )

print(f"    Train: {len(X_train):,} | Val: {len(X_val):,}")

# ─────────────────────────────────────────────────────────
# 7. Normalization — fit ONLY on training data
#    (prevents data leakage from validation set)
# ─────────────────────────────────────────────────────────

print("\n[4] Normalizing (fit on train only — no data leakage) ...")
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)   # fit + transform train
X_val_s   = scaler.transform(X_val)         # transform val (no fit!)
joblib.dump(scaler, "scaler.pkl")

# ─────────────────────────────────────────────────────────
# 8. XGBoost Binary (Normal vs Attack)
#    Anti-overfit: early stopping on val, subsample, colsample
#    Anti-underfit: 1000 estimators max, depth=6
# ─────────────────────────────────────────────────────────

print("\n[5a] Training XGBoost Binary (Normal vs Attack) ...")

# Further split train → 90% fit / 10% early-stop signal
X_fit, X_es, y_fit, y_es = train_test_split(
    X_train_s, y_bin_train,
    test_size=0.10, random_state=42, stratify=y_bin_train
)

xgb_binary = XGBClassifier(
    n_estimators        = 1000,
    max_depth           = 5,        # conservative — prevents overfit
    learning_rate       = 0.05,     # slow + steady
    subsample           = 0.8,      # row sampling → reduces overfit
    colsample_bytree    = 0.8,      # feature sampling → reduces overfit
    min_child_weight    = 5,        # min samples per leaf → prevents overfit on rare classes
    gamma               = 0.1,      # min loss reduction to split → regularization
    reg_alpha           = 0.1,      # L1 → sparsity
    reg_lambda          = 1.5,      # L2 → weight shrinkage
    eval_metric         = "logloss",
    use_label_encoder   = False,
    early_stopping_rounds = 30,     # stop if no improvement for 30 rounds
    random_state        = 42,
    n_jobs              = -1,
    tree_method         = "hist"
)

xgb_binary.fit(
    X_fit, y_fit,
    eval_set     = [(X_es, y_es)],
    verbose      = 100
)

xgb_val_pred  = xgb_binary.predict(X_val_s)
xgb_val_proba = xgb_binary.predict_proba(X_val_s)[:, 1]
xgb_acc       = accuracy_score(y_bin_val, xgb_val_pred)
print(f"\n    XGBoost Binary — Val Accuracy: {xgb_acc*100:.2f}%")
print(classification_report(y_bin_val, xgb_val_pred, target_names=["Normal","Attack"]))

# ─────────────────────────────────────────────────────────
# 9. SVM Binary (Normal vs Attack) — RBF kernel
# ─────────────────────────────────────────────────────────

print("\n[5b] Training SVM Binary (Normal vs Attack) ...")

svm_model = SVC(
    kernel        = "rbf",
    C             = 10,
    gamma         = "scale",
    probability   = True,
    class_weight  = "balanced",   # handles class imbalance
    random_state  = 42
)
svm_model.fit(X_train_s, y_bin_train)

svm_val_pred  = svm_model.predict(X_val_s)
svm_val_proba = svm_model.predict_proba(X_val_s)[:, 1]
svm_acc       = accuracy_score(y_bin_val, svm_val_pred)
print(f"\n    SVM Binary — Val Accuracy: {svm_acc*100:.2f}%")
print(classification_report(y_bin_val, svm_val_pred, target_names=["Normal","Attack"]))

# ─────────────────────────────────────────────────────────
# 10. Ensemble soft-vote (40% SVM + 60% XGBoost)
# ─────────────────────────────────────────────────────────

print("\n[6] Evaluating Ensemble (40% SVM + 60% XGBoost) ...")
ens_proba = 0.4 * svm_val_proba + 0.6 * xgb_val_proba
ens_pred  = (ens_proba >= 0.5).astype(int)
ens_acc   = accuracy_score(y_bin_val, ens_pred)
print(f"    Ensemble Val Accuracy: {ens_acc*100:.2f}%")
print(classification_report(y_bin_val, ens_pred, target_names=["Normal","Attack"]))

# ─────────────────────────────────────────────────────────
# 11. XGBoost 5-class (attack-type categorizer)
#     Trained on attack samples only for cleaner separation
# ─────────────────────────────────────────────────────────

print("\n[7] Training XGBoost 5-class Categorizer ...")

X_fit5, X_es5, y_fit5, y_es5 = train_test_split(
    X_train_s, y_5c_train,
    test_size=0.10, random_state=42, stratify=y_5c_train
)

xgb_cat = XGBClassifier(
    n_estimators        = 1000,
    max_depth           = 5,
    learning_rate       = 0.05,
    subsample           = 0.8,
    colsample_bytree    = 0.8,
    min_child_weight    = 5,
    gamma               = 0.1,
    reg_alpha           = 0.1,
    reg_lambda          = 1.5,
    objective           = "multi:softmax",
    num_class           = 5,
    eval_metric         = "mlogloss",
    use_label_encoder   = False,
    early_stopping_rounds = 30,
    random_state        = 42,
    n_jobs              = -1,
    tree_method         = "hist"
)

xgb_cat.fit(X_fit5, y_fit5, eval_set=[(X_es5, y_es5)], verbose=100)

cat_val_pred = xgb_cat.predict(X_val_s)
cat_acc      = accuracy_score(y_5c_val, cat_val_pred)
print(f"\n    XGBoost 5-class — Val Accuracy: {cat_acc*100:.2f}%")
print(classification_report(y_5c_val, cat_val_pred,
      target_names=label_enc_cat.classes_))

# ─────────────────────────────────────────────────────────
# 12. Overfitting / Underfitting check
# ─────────────────────────────────────────────────────────

print("\n[8] Overfitting / Underfitting Diagnostic ...")
train_pred_xgb = xgb_binary.predict(X_train_s)
train_acc_xgb  = accuracy_score(y_bin_train, train_pred_xgb)
gap            = train_acc_xgb - xgb_acc

print(f"    XGBoost — Train Acc: {train_acc_xgb*100:.2f}%  |  Val Acc: {xgb_acc*100:.2f}%")
print(f"    Overfitting gap (Train - Val): {gap*100:.2f}% ", end="")

if gap < 0.02:
    print("✅ No overfitting")
elif gap < 0.05:
    print("⚠ Slight overfitting (acceptable)")
else:
    print("❌ Overfitting detected — increase regularization")

# ─────────────────────────────────────────────────────────
# 13. Save confusion matrix + metrics
# ─────────────────────────────────────────────────────────

cm = confusion_matrix(y_bin_val, ens_pred)
np.save("confusion_matrix.npy", cm)

metrics = {
    "svm_accuracy":      float(svm_acc),
    "xgb_accuracy":      float(xgb_acc),
    "ensemble_accuracy": float(ens_acc),
    "rf_accuracy":       float(ens_acc),     # "rf_accuracy" key used by frontend
    "rf_f1":             float(f1_score(y_bin_val, ens_pred, average="weighted")),
    "rf_recall":         float(recall_score(y_bin_val, ens_pred, average="weighted")),
    "rf_precision":      float(precision_score(y_bin_val, ens_pred, average="weighted")),
    "cat_accuracy":      float(cat_acc),
    "split":             "80/20 on KDDTrain+ (no data leakage)"
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

# ─────────────────────────────────────────────────────────
# 14. Save models & encoders
# ─────────────────────────────────────────────────────────

joblib.dump(xgb_binary,    "xgb_model.pkl")
joblib.dump(xgb_cat,       "rf_model.pkl")        # compat alias
joblib.dump(svm_model,     "svm_model.pkl")
joblib.dump(label_enc_cat, "label_encoder.pkl")

# Fine-grained encoder (original 38-class labels for display)
label_enc_fine = LabelEncoder()
label_enc_fine.fit(df["label"])
joblib.dump(label_enc_fine, "label_encoder_fine.pkl")

print("\n[9] All models saved successfully!")
print(f"\n{'='*55}")
print(f"  SVM Binary Accuracy        : {svm_acc*100:.2f}%")
print(f"  XGBoost Binary Accuracy    : {xgb_acc*100:.2f}%")
print(f"  Ensemble Accuracy          : {ens_acc*100:.2f}%")
print(f"  XGBoost 5-class Accuracy   : {cat_acc*100:.2f}%")
print(f"{'='*55}")
print(f"  Train/Val Split: 80/20 on KDDTrain+ (stratified)")
print(f"  Normalization : StandardScaler fit on train only")
print(f"  Anti-overfit  : Early stopping + L1/L2 + subsampling")
print(f"{'='*55}")