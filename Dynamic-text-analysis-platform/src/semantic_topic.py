from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import nltk


model = SentenceTransformer("all-MiniLM-L6-v2")


def semantic_topic_scores(text, n_topics=3):
    # 1. Split into sentences
    sentences = nltk.sent_tokenize(text)
    if len(sentences) < 2:
        return {"General": 1.0}

    # 2. Encode sentences
    embeddings = model.encode(sentences)

    # 3. Decide clusters automatically
    k = min(n_topics, len(sentences))
    kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
    labels = kmeans.fit_predict(embeddings)

    # 4. Group sentences by cluster
    clusters = {}
    for i, label in enumerate(labels):
        clusters.setdefault(label, []).append(sentences[i])

    # 5. Extract topic names using TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english", max_features=4)
    topic_scores = {}

    for label, group in clusters.items():
        tfidf = vectorizer.fit_transform(group)
        words = vectorizer.get_feature_names_out()
        scores = tfidf.toarray().sum(axis=0)

        top_words = [words[i] for i in scores.argsort()[-3:]]
        topic_name = " ".join(top_words).title()

        topic_scores[topic_name] = len(group)

    # 6. Normalize to probabilities
    total = sum(topic_scores.values())
    for k in topic_scores:
        topic_scores[k] /= total

    return topic_scores