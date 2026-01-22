"""

import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict
import math


def summarize_text(text, num_sentences=3):
    sentences = sent_tokenize(text)

    if len(sentences) <= num_sentences:
        return sentences  # short text, return as is

    stop_words = set(stopwords.words("english"))

    # Step 1: Word frequency
    word_freq = defaultdict(int)
    words = word_tokenize(text.lower())

    for word in words:
        if word.isalpha() and word not in stop_words:
            word_freq[word] += 1

    # Normalize frequency
    max_freq = max(word_freq.values())
    for word in word_freq:
        word_freq[word] /= max_freq

    # Step 2: Sentence scoring
    sentence_scores = defaultdict(float)

    for sent in sentences:
        for word in word_tokenize(sent.lower()):
            if word in word_freq:
                sentence_scores[sent] += word_freq[word]

    # Step 3: Pick top sentences
    ranked_sentences = sorted(
        sentence_scores,
        key=sentence_scores.get,
        reverse=True
    )

    summary = ranked_sentences[:num_sentences]

    return summary


"""




import nltk
import re
import numpy as np
import networkx as nx

from nltk.tokenize import sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def clean_sentence(sentence):
    sentence = re.sub(r"http\S+", "", sentence)
    sentence = re.sub(r"\S+@\S+", "", sentence)
    sentence = re.sub(r"#\w+", "", sentence)
    sentence = re.sub(r"[^\w\s.,]", "", sentence)
    return sentence.strip()


def summarize_text(text, num_sentences=3):
    # 1️⃣ Sentence tokenize (RAW text)
    sentences = sent_tokenize(text)

    if len(sentences) <= num_sentences:
        return sentences

    # Clean sentences (light cleaning only)
    clean_sentences = [clean_sentence(s) for s in sentences]

    # 2️⃣ TF-IDF sentence embeddings
    vectorizer = TfidfVectorizer(stop_words="english")
    sentence_vectors = vectorizer.fit_transform(clean_sentences)

    # 3️⃣ Sentence similarity matrix
    similarity_matrix = cosine_similarity(sentence_vectors)

    # 4️⃣ Build similarity graph
    sentence_graph = nx.from_numpy_array(similarity_matrix)

    # 5️⃣ PageRank scoring
    scores = nx.pagerank(sentence_graph)

    # 6️⃣ Rank sentences by PageRank score
    ranked_sentences = sorted(
        ((scores[i], s) for i, s in enumerate(sentences)),
        reverse=True
    )

    # 7️⃣ Pick top N sentences
    selected_sentences = [s for _, s in ranked_sentences[:num_sentences]]

    # 8️⃣ Preserve original document order
    ordered_summary = [s for s in sentences if s in selected_sentences]

    return ordered_summary