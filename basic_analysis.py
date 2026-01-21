from collections import Counter

def extract_topics_basic(tokens, num_topics=2):
    freq = Counter(tokens)
    common_words = freq.most_common(20)
    topics = {}
    split = len(common_words) // num_topics
    for i in range(num_topics):
        topic_words = common_words[i*split:(i+1)*split]
        topics[f"Topic {i+1}"] = [w for w, _ in topic_words]
    return topics

def sentiment_basic(tokens):
    positive = {"good", "great", "excellent", "success", "positive", "happy"}
    negative = {"bad", "poor", "failure", "negative", "sad", "worst","not","never"}
    pos = sum(1 for w in tokens if w in positive)
    neg = sum(1 for w in tokens if w in negative)
    if pos > neg:
        return "Positive"
    elif neg > pos:
        return "Negative"
    else:
        return "Neutral"

def summarize_text(text, n=2):
    sentences = text.split(".")
    words = text.lower().split()
    freq = Counter(words)
    scores = {}
    for sent in sentences:
        for word in sent.lower().split():
            scores[sent] = scores.get(sent, 0) + freq.get(word, 0)
    summary = sorted(scores, key=scores.get, reverse=True)[:n]
    return ". ".join(summary)
