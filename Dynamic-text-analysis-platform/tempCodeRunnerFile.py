
import nltk
import matplotlib.pyplot as plt
import numpy as np
import os


from gensim.corpora import Dictionary
from gensim.models import CoherenceModel
from collections import Counter


from src.input_handler import load_texts
from src.preprocessing import preprocess_text
from src.topic_model import create_dtm, apply_lda, display_topics
from src.sentiment_vader import vader_sentiment
#(activate it when you want to run distilbert)
#from src.sentiment_distilbert import distilbert_sentiment
from src.logistic_sentiment import logistic_sentiment
from src.summarization import summarize_text
#(activate it when you want to run distilbart summarisation)

from src.summarization_distilbart import distilbart_summarize









def download_nltk_resources():
    nltk.download("punkt")
    nltk.download("stopwords")
    nltk.download("wordnet")
    nltk.download("vader_lexicon")


def compute_coherence(lda_model, cleaned_texts, vectorizer, top_n=10):
    tokenized_texts = [text.split() for text in cleaned_texts]
    dictionary = Dictionary(tokenized_texts)

    feature_names = vectorizer.get_feature_names_out()
    topics = []

    for topic_weights in lda_model.components_:
        top_words = [
            feature_names[i]
            for i in topic_weights.argsort()[:-top_n - 1:-1]
        ]
        topics.append(top_words)

    coherence_model = CoherenceModel(
        topics=topics,
        texts=tokenized_texts,
        dictionary=dictionary,
        coherence='c_v'
    )

    return coherence_model.get_coherence()


# 🔐 REQUIRED ON WINDOWS
if __name__ == "__main__":


    os.makedirs("outputs/graphs", exist_ok=True)
    os.makedirs("outputs/results", exist_ok=True)

    # 1️⃣ Load & preprocess data
    texts = load_texts()
    cleaned_texts = [preprocess_text(t) for t in texts]
    #sorting important bigiluuuuuuuuuuu boggu ayipoyav ga................
    """print("\n📄 RAW TEXT OF DOCUMENT 11 (doc11.txt):\n")
    print(texts[10])
    print("\n" + "="*80 + "\n")

    print("\nRAW DOCUMENT 4:\n")
    print(texts[3])
    print("\nRAW DOCUMENT 12:\n")
    print(texts[11])


    # 🔎 PRINT PREPROCESSED WORDS (YOU ASKED THIS)
    print("\n🧹 Preprocessed words for each document:\n")
    for i, doc in enumerate(cleaned_texts):
        words = doc.split()
        print(f"Document {i + 1}:")
        print(words)
        print("-" * 60)"""

    # 2️⃣ Create DTM
    dtm, vectorizer = create_dtm(cleaned_texts)

    # 3️⃣ Topic range to evaluate
    topic_values = [2, 4, 5, 6, 7, 8, 10]

    perplexity_scores = []
    coherence_scores = []

    print("\n📊 Evaluating topic models:\n")

    # 4️⃣ Train & evaluate models
    for k in topic_values:
        lda_model = apply_lda(dtm, n_topics=k)

        perplexity = lda_model.perplexity(dtm)
        coherence = compute_coherence(lda_model, cleaned_texts, vectorizer)

        perplexity_scores.append(perplexity)
        coherence_scores.append(coherence)

        print(f"Topics: {k}")
        print(f"  Perplexity: {perplexity}")
        print(f"  Coherence: {coherence}\n")

    # 5️⃣ Plot graphs
    plt.figure(figsize=(12, 5))

    # Perplexity plot
    plt.subplot(1, 2, 1)
    plt.plot(topic_values, perplexity_scores, marker='o')
    plt.xlabel("Number of Topics")
    plt.ylabel("Perplexity")
    plt.title("Perplexity vs Number of Topics")
    plt.grid(True)

    # Coherence plot
    plt.subplot(1, 2, 2)
    plt.plot(topic_values, coherence_scores, marker='o')
    plt.xlabel("Number of Topics")
    plt.ylabel("Coherence Score")
    plt.title("Coherence vs Number of Topics")
    plt.grid(True)

    plt.tight_layout()
    plt.savefig("outputs/graphs/perplexity_coherence.png", dpi=300)
    plt.show()

    # 6️⃣ Automatically select best topic count
    best_index = np.argmax(coherence_scores)
    BEST_NUM_TOPICS = topic_values[best_index]

    print(f"\n✅ Automatically selected best number of topics: {BEST_NUM_TOPICS}")

    # 7️⃣ Train final model
    final_lda_model = apply_lda(dtm, n_topics=BEST_NUM_TOPICS)

    print("\n🧠 Final selected model topics:\n")
    topic_name_map = display_topics(final_lda_model, vectorizer, n_words=10)


    # 8️⃣ DOCUMENT–TOPIC DISTRIBUTION
    doc_topic_dist= final_lda_model.transform(dtm)

    print("\n📄 Document–Topic Distribution (With Topic Names):\n")
    dominant_topics = []

    for doc_idx, topic_probs in enumerate(doc_topic_dist):
        print(f"Document {doc_idx + 1}:")

        for topic_idx, prob in enumerate(topic_probs):
            topic_id = topic_idx + 1
            topic_name = topic_name_map[topic_id]
            print(f"  {topic_name}: {prob * 100:.2f}%")

        dominant_topic_id = topic_probs.argmax() + 1
        dominant_topic_name = topic_name_map[dominant_topic_id]
        dominant_topics.append(dominant_topic_name)  
        print(f"  👉 Dominant Topic: {dominant_topic_name}\n")

    # =======================
    # 📊 DOMINANT TOPIC FREQUENCY GRAPH
    # =======================

    topic_counts = Counter(dominant_topics)

    topics = list(topic_counts.keys())
    counts = list(topic_counts.values())

    plt.figure(figsize=(8, 5))
    plt.bar(topics, counts)
    plt.xlabel("Topics")
    plt.ylabel("Number of Documents")
    plt.title("Dominant Topic Distribution Across Documents")
    plt.xticks(rotation=45, ha="right")
    plt.grid(axis="y")

    plt.tight_layout()
    plt.savefig("outputs/graphs/dominant_topic_distribution.png", dpi=300)
    plt.show()

   
    print("\n🔍 SENTIMENT COMPARISON (VADER vs LOGISTIC vs DistilBERT)\n")
    vader_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    logistic_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    bert_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    #((keep it false when yOU dont want to run distilbart)
    RUN_DISTILBART = True   # change to False to skip summarization

    for i, text in enumerate(texts):
        print(f"📄 Document {i+1}:")

        summary = summarize_text(text, num_sentences=3)
        print("📝 Summary:")
        for point in summary:
           print(f"• {point}")


        vader_result = vader_sentiment(text)
        logistic_result = logistic_sentiment(text)
        #have to comment for pause distilbert
        #bert_result = distilbert_sentiment(text)

        vader_label = vader_result["sentiment"].split()[0]
        logistic_label = logistic_result["sentiment"].split()[0]
        #have to comment for pause distilbert
        #bert_label = bert_result["sentiment"].split()[0]

        vader_counts[vader_label] += 1
        logistic_counts[logistic_label] += 1
        #have to comment for pause distilbert
        #bert_counts[bert_label] += 1

        print("🧪 VADER Result:")
        print(f"  Sentiment : {vader_result['sentiment']}")
        print(f"  Compound  : {vader_result['compound']}")

        
        print("\n📊 Logistic Regression Result:")
        print(f"  Sentiment  : {logistic_result['sentiment']}")
        print(f"  Confidence : {logistic_result['confidence']:.2f}")

      #have to comment for pause distilbert
       # print("\n🤖 DistilBERT Result:")
       # print(f"  Sentiment : {bert_result['sentiment']}")
       # print(f"  Confidence: {bert_result['confidence']:.2f}")
        #until this

        # 📝 SUMMARY
       

        if RUN_DISTILBART:
          summary = distilbart_summarize(text)
          print("📝 Summary:")
          for line in summary:
            print(f"• {line}")

        print("-" * 60)
    labels = ["Positive", "Neutral", "Negative"]

    vader_values = [vader_counts[l] for l in labels]
    logistic_values = [logistic_counts[l] for l in labels]
    #have to comment for pause distilbert
    #bert_values = [bert_counts[l] for l in labels]

    x = np.arange(len(labels))
    width = 0.25

    plt.figure(figsize=(9, 5))

    plt.bar(x - width, vader_values, width, label="VADER")
    plt.bar(x, logistic_values, width, label="Logistic Regression")
    #have to comment for pause distilbert
    #plt.bar(x + width, bert_values, width, label="DistilBERT")

    plt.xlabel("Sentiment")
    plt.ylabel("Number of Documents")
    plt.title("Sentiment Comparison Across Models")
    plt.xticks(x, labels)
    plt.legend()
    plt.grid(axis="y")

    plt.tight_layout()
    plt.savefig("outputs/graphs/sentiment_model_comparison.png", dpi=300)
    plt.show()



