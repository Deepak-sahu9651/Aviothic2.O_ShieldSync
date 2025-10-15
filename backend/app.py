from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
from utils.preprocess import extract_features
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Home route so browser root shows a message
@app.route("/")
def home():
    return jsonify({"message":"Welcome to PhishGuard Backend! 🎯"})

MODEL_PATH = os.path.join("model", "pipeline.joblib")
if not os.path.exists(MODEL_PATH):
    raise SystemExit("Model not found. Run train.py first to create model/pipeline.joblib")

pipeline = joblib.load(MODEL_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    url = data.get("url", "")
    features = extract_features(url)
    feat_vals = [list(features.values())]
    pred = pipeline.predict(feat_vals)[0]
    proba = pipeline.predict_proba(feat_vals)[0].tolist() if hasattr(pipeline, "predict_proba") else None
    label = "phishing" if int(pred) == 1 else "legit"
    response = {
        "url": url,
        "prediction": label,
        "probability": proba,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    return jsonify(response)

@app.route("/report", methods=["POST"])
def report():
    data = request.get_json(force=True)
    # quick save to file (replace with DB later)
    with open("reports.log", "a", encoding="utf-8") as f:
        f.write(str(data) + "\n")
    return jsonify({"status":"ok"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
