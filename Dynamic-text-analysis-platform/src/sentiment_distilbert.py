from transformers import pipeline

# Load once
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def distilbert_sentiment(text):
    result = sentiment_pipeline(text[:512])[0]

    label = result["label"]          # POSITIVE / NEGATIVE
    score = result["score"]          # confidence (0–1)

    # 🔥 REAL signed neural output
    signed_score = score if label == "POSITIVE" else -score

    return {
        "label": label,
        "score": score,
        "signed_score": signed_score
    }