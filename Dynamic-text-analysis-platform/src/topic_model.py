

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation


def create_dtm(cleaned_texts):
    vectorizer = CountVectorizer(
        max_df=0.80,
        min_df=2,
        stop_words='english'
    )
    dtm = vectorizer.fit_transform(cleaned_texts)
    return dtm, vectorizer


def apply_lda(dtm, n_topics=5):
    lda = LatentDirichletAllocation(
        n_components=n_topics,
        max_iter=20,
        learning_method='batch',
        random_state=42
    )
    lda.fit(dtm)
    return lda


def display_topics(lda_model, vectorizer, n_words=10):
    feature_names = vectorizer.get_feature_names_out()

    topic_name_map = {}

    for topic_idx, topic in enumerate(lda_model.components_):
        top_words = [
            feature_names[i]
            for i in topic.argsort()[:-n_words-1:-1]
        ]

        # 🔹 AUTO TOPIC NAME (your idea)
        topic_name = "_".join(top_words[:2])   # first 2 words
        # topic_name = "_".join(top_words[:3]) # ← optional (3 words)

        topic_id = topic_idx + 1
        topic_name_map[topic_id] = topic_name

        print(f"\nTopic {topic_id} → {topic_name}")
        print(top_words)

    return topic_name_map
