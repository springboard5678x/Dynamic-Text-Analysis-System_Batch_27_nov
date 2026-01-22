from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

nltk.download('vader_lexicon')

from collections import Counter

# ----- Simple frequency-based "LDA" -----
def extract_topics_lda(text, num_topics=2, num_words=5):
    words = [w.lower() for w in text.split() if w.isalpha()]
    freq = Counter(words)
    common_words = [w for w,_ in freq.most_common(num_topics * num_words)]
    
    topics = {}
    split = len(common_words) // num_topics
    for i in range(num_topics):
        topic_words = common_words[i*split:(i+1)*split]
        topics[f"Topic {i+1}"] = topic_words
    return topics

# ----- VADER sentiment -----
def sentiment_vader(text):
    sia = SentimentIntensityAnalyzer()
    score = sia.polarity_scores(text)['compound']
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"
