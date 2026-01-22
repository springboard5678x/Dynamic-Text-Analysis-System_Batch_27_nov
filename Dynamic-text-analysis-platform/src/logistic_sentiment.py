
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# --------------------------------------------------
# 1️⃣ TRAINING DATA (simple but effective)
# --------------------------------------------------

train_texts = [
    "I love this product, it is amazing",
    "This is the best experience ever",
    "Very happy and satisfied",
    "Excellent performance and great results",

    "I hate this, very bad experience",
    "Worst service ever",
    "Completely disappointed and unhappy",
    "Terrible product and poor quality"
]

train_labels = [
    1, 1, 1, 1,   # Positive
    0, 0, 0, 0    # Negative
]

# --------------------------------------------------
# 2️⃣ Vectorizer + Model (loaded once)
# --------------------------------------------------

vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words="english"
)

X_train = vectorizer.fit_transform(train_texts)

model = LogisticRegression()
model.fit(X_train, train_labels)

# --------------------------------------------------
# 3️⃣ Prediction function
# --------------------------------------------------

def logistic_sentiment(text):
    X_test = vectorizer.transform([text])
    prob = model.predict_proba(X_test)[0]

    positive_prob = prob[1]
    negative_prob = prob[0]

    if positive_prob > 0.6:
        sentiment = "Positive 😊"
    elif negative_prob > 0.6:
        sentiment = "Negative 😞"
    else:
        sentiment = "Neutral 😐"

    return {
        "model": "Logistic Regression",
        "sentiment": sentiment,
        "positive": positive_prob,
        "negative": negative_prob
    }

"""

"""
import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

MODEL_PATH = "outputs/models/logistic_sentiment.pkl"
VECTORIZER_PATH = "outputs/models/tfidf_vectorizer.pkl"

def train_logistic_model(csv_path="data/sentiment_train.csv"):
    df = pd.read_csv(csv_path)

    X = df["text"]
    y = df["label"]

    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2)
    )

    X_vec = vectorizer.fit_transform(X)

    model = LogisticRegression(
        max_iter=1000
    )

    model.fit(X_vec, y)
    os.makedirs("outputs/models", exist_ok=True)


    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    print("✅ Logistic Regression trained & saved")


"""



import pandas as pd
import joblib
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

MODEL_PATH = "outputs/models/logistic_sentiment.pkl"
VECTORIZER_PATH = "outputs/models/tfidf_vectorizer.pkl"
ENCODER_PATH = "outputs/models/label_encoder.pkl"


# ==========================
# 🔹 TRAINING FUNCTION
# ==========================
def train_logistic_model(csv_path="data/sentiment_train.csv"):
    df = pd.read_csv(csv_path)

    X = df["text"]
    y = df["label"]

    # ✅ Encode labels (VERY IMPORTANT)
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    vectorizer = TfidfVectorizer(
        max_features=6000,
        ngram_range=(1, 2),
        stop_words="english"
    )

    X_vec = vectorizer.fit_transform(X)

    model = LogisticRegression(
        max_iter=2000,
        class_weight="balanced"   # 🔥 FIXES NEUTRAL BIAS
    )

    model.fit(X_vec, y_encoded)

    os.makedirs("outputs/models", exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    joblib.dump(encoder, ENCODER_PATH)

    print("✅ Logistic Regression trained & saved successfully")


# ==========================
# 🔹 PREDICTION FUNCTION
# ==========================
def logistic_sentiment(text):
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    encoder = joblib.load(ENCODER_PATH)

    X_vec = vectorizer.transform([text])

    pred_encoded = model.predict(X_vec)[0]
    probs = model.predict_proba(X_vec)[0]

    label = encoder.inverse_transform([pred_encoded])[0]

    emoji_map = {
        "Positive": "Positive 😊",
        "Neutral": "Neutral 😐",
        "Negative": "Negative 😞"
    }

    return {
        "model": "Logistic Regression",
        "sentiment": emoji_map[label],
        "confidence": float(max(probs))
    }
