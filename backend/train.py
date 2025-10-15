import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib
from utils.preprocess import extract_features

# Paths
DATA_PATH = os.path.join("data", "urls_labeled.csv")
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "pipeline.joblib")

os.makedirs(MODEL_DIR, exist_ok=True)

# Load data
df = pd.read_csv(DATA_PATH)
# Ensure columns exist
if "url" not in df.columns or "label" not in df.columns:
    raise SystemExit("CSV must have \"url\" and \"label\" columns")

# Build features
features = [extract_features(u) for u in df["url"].astype(str)]
X = pd.DataFrame(features)
y = df["label"].map({"legit": 0, "phishing": 1})

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(n_estimators=100, random_state=42))
])

pipeline.fit(X_train, y_train)
score = pipeline.score(X_test, y_test)
print(f"Test accuracy: {score:.4f}")

joblib.dump(pipeline, MODEL_PATH)
print(f"Saved pipeline to {MODEL_PATH}")
