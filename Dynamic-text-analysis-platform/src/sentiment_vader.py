from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Initialize once
sia = SentimentIntensityAnalyzer()

def vader_sentiment(text):
    scores = sia.polarity_scores(text)

    pos = scores["pos"]
    neu = scores["neu"]
    neg = scores["neg"]
    compound = scores["compound"]

    # Correct sentiment decision
    if compound >= 0.05:
        label = "Positive 😊"
    elif compound <= -0.05:
        label = "Negative 😞"
    else:
        label = "Neutral 😐"

    return {
        "model": "VADER",
        "sentiment": label,
        "positive": pos,
        "neutral": neu,
        "negative": neg,
        "compound": compound
    }
