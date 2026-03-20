import pandas as pd
import joblib
import json
import numpy as np

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score
)

# -------------------------
# Columns
# -------------------------

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

# -------------------------
# Load Dataset
# -------------------------

train_df = pd.read_csv("KDDTrain+.txt", names=columns)
test_df = pd.read_csv("KDDTest+.txt", names=columns)

train_df.drop("difficulty", axis=1, inplace=True)
test_df.drop("difficulty", axis=1, inplace=True)

# -------------------------
# Feature Selection
# -------------------------

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

train_df = train_df[selected_features + ["label"]]
test_df = test_df[selected_features + ["label"]]

# -------------------------
# Encode categorical
# -------------------------

categorical_cols = ["protocol_type", "service", "flag"]
encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    combined = pd.concat([train_df[col], test_df[col]])
    le.fit(combined)

    train_df[col] = le.transform(train_df[col])
    test_df[col] = le.transform(test_df[col])

    encoders[col] = le

# -------------------------
# Encode labels
# -------------------------

label_encoder = LabelEncoder()
combined_labels = pd.concat([train_df["label"], test_df["label"]])
label_encoder.fit(combined_labels)

train_df["label"] = label_encoder.transform(train_df["label"])
test_df["label"] = label_encoder.transform(test_df["label"])

X_train = train_df.drop("label", axis=1)
y_train = train_df["label"]

X_test = test_df.drop("label", axis=1)
y_test = test_df["label"]

# -------------------------
# Binary labels for SVM
# -------------------------

normal_label = label_encoder.transform(["normal"])[0]

y_train_binary = (y_train != normal_label).astype(int)
y_test_binary = (y_test != normal_label).astype(int)

# -------------------------
# Scaling for SVM
# -------------------------

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# -------------------------
# Train SVM (Stage 1)
# -------------------------

print("\nTraining SVM...")

svm_model = LinearSVC()

svm_model.fit(X_train_scaled, y_train_binary)
svm_pred = svm_model.predict(X_test_scaled)

svm_accuracy = accuracy_score(y_test_binary, svm_pred)

print("\nSVM Accuracy:", svm_accuracy)
print("\nSVM Report:\n", classification_report(y_test_binary, svm_pred))

# -------------------------
# Train Random Forest
# -------------------------

print("\nTraining Random Forest...")

rf_model = RandomForestClassifier(
    n_estimators=200,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_pred)

print("\nRandom Forest Accuracy:", rf_accuracy)
print("\nRF Report:\n", classification_report(y_test, rf_pred))

# -------------------------
# Save evaluation files
# -------------------------

cm_rf = confusion_matrix(y_test, rf_pred)
np.save("confusion_matrix.npy", cm_rf)

metrics = {
    "svm_accuracy": float(svm_accuracy),
    "rf_accuracy": float(rf_accuracy),
    "rf_f1": float(f1_score(y_test, rf_pred, average="weighted")),
    "rf_recall": float(recall_score(y_test, rf_pred, average="weighted")),
    "rf_precision": float(precision_score(y_test, rf_pred, average="weighted"))
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f)

# -------------------------
# Save models
# -------------------------

joblib.dump(rf_model, "rf_model.pkl")
joblib.dump(svm_model, "svm_model.pkl")
joblib.dump(encoders, "encoders.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")
joblib.dump(scaler, "scaler.pkl")

print("\nAll models & files saved successfully!")