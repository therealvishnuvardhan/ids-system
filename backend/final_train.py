
# IDS TRAINING USING NSL-KDD DATASET

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

print("Loading NSL-KDD dataset...")

# NSL-KDD column names
columns = [
"duration","protocol_type","service","flag","src_bytes","dst_bytes","land","wrong_fragment",
"urgent","hot","num_failed_logins","logged_in","num_compromised","root_shell","su_attempted",
"num_root","num_file_creations","num_shells","num_access_files","num_outbound_cmds",
"is_host_login","is_guest_login","count","srv_count","serror_rate","srv_serror_rate",
"rerror_rate","srv_rerror_rate","same_srv_rate","diff_srv_rate","srv_diff_host_rate",
"dst_host_count","dst_host_srv_count","dst_host_same_srv_rate","dst_host_diff_srv_rate",
"dst_host_same_src_port_rate","dst_host_srv_diff_host_rate","dst_host_serror_rate",
"dst_host_srv_serror_rate","dst_host_rerror_rate","dst_host_srv_rerror_rate","label","difficulty"
]

train = pd.read_csv("KDDTrain+.txt", names=columns)
test = pd.read_csv("KDDTest+.txt", names=columns)

print("Train rows:", len(train))
print("Test rows:", len(test))

# FEATURES USED IN PROJECT

features = [
'duration',
'protocol_type',
'src_bytes',
'dst_bytes',
'count',
'serror_rate'
]

# CLEAN LABELS

train['label'] = train['label'].astype(str).str.replace('.', '', regex=False)
test['label'] = test['label'].astype(str).str.replace('.', '', regex=False)

# ENCODE PROTOCOL

protocol_map = {
'tcp':0,
'udp':1,
'icmp':2
}

train['protocol_type'] = train['protocol_type'].map(protocol_map)
test['protocol_type'] = test['protocol_type'].map(protocol_map)

train.fillna(0, inplace=True)
test.fillna(0, inplace=True)

# BINARY LABEL

train['binary_label'] = train['label'].apply(lambda x: 0 if x=="normal" else 1)
test['binary_label'] = test['label'].apply(lambda x: 0 if x=="normal" else 1)

# BINARY MODEL

print("\nTraining Binary IDS Model...")

X_train = train[features]
y_train = train['binary_label']

X_test = test[features]
y_test = test['binary_label']

binary_model = DecisionTreeClassifier(max_depth=5)

binary_model.fit(X_train, y_train)

binary_pred = binary_model.predict(X_test)

binary_acc = accuracy_score(y_test, binary_pred)

print("\n===== BINARY RESULTS =====")
print("Accuracy:", binary_acc)
print(classification_report(y_test, binary_pred))

# Binary confusion matrix

cm_bin = confusion_matrix(y_test, binary_pred)

plt.figure()

sns.heatmap(
    cm_bin,
    annot=True,
    fmt='d',
    cmap="Blues",
    xticklabels=["Normal","Attack"],
    yticklabels=["Normal","Attack"]
)

plt.title("Binary Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.show()

# MULTI CLASS MODEL

print("\nTraining Multi-Class Attack Classifier...")

attack_train = train[train['binary_label']==1]
attack_test = test[test['binary_label']==1]

X_train_multi = attack_train[features]
y_train_multi = attack_train['label']

X_test_multi = attack_test[features]
y_test_multi = attack_test['label']

multi_model = DecisionTreeClassifier(max_depth=6)

multi_model.fit(X_train_multi, y_train_multi)

multi_pred = multi_model.predict(X_test_multi)

multi_acc = accuracy_score(y_test_multi, multi_pred)

print("\n===== MULTI CLASS RESULTS =====")
print("Accuracy:", multi_acc)
print(classification_report(y_test_multi, multi_pred))

# Multi confusion matrix

cm_multi = confusion_matrix(y_test_multi, multi_pred)

plt.figure(figsize=(10,7))

sns.heatmap(
    cm_multi,
    cmap="Reds",
    annot=False
)

plt.title("Multi-Class Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")

plt.show()

# ATTACK DISTRIBUTION GRAPH

plt.figure(figsize=(10,5))

attack_train['label'].value_counts().head(10).plot(kind='bar')

plt.title("Top Attack Types in Training Dataset")
plt.xlabel("Attack Type")
plt.ylabel("Count")

plt.show()

# ACCURACY COMPARISON GRAPH

plt.figure()

plt.bar(
['Binary IDS','Multi-Class IDS'],
[binary_acc, multi_acc]
)

plt.title("IDS Accuracy Comparison")
plt.ylabel("Accuracy")

plt.show()

# SAVE MODELS

joblib.dump(binary_model,"binary_model.pkl")
joblib.dump(multi_model,"multi_model.pkl")

print("\n TRAINING COMPLETED SUCCESSFULLY")
print("Models saved: binary_model.pkl , multi_model.pkl")