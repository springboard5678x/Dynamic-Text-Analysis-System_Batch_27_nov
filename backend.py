import PyPDF2
import pandas as pd
from docx import Document
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from wordcloud import WordCloud
import matplotlib.pyplot as plt

# ---------------- FILE READERS ---------------- #
def read_pdf(file):
    try:
        reader = PyPDF2.PdfReader(file)
        return " ".join([page.extract_text() or "" for page in reader.pages])
    except:
        return "Error reading PDF"

def read_word(file):
    try:
        doc = Document(file)
        return "\n".join([p.text for p in doc.paragraphs])
    except:
        return "Error reading Word file"

def read_csv(file):
    try:
        df = pd.read_csv(file)
        return " ".join(df.astype(str).values.flatten())
    except:
        return "Error reading CSV"

# ---------------- ANALYSIS ---------------- #
def analyze_text_stats(text):
    words = text.split()
    sentences = [s for s in text.split('.') if len(s.strip()) > 5]
    return len(text), len(words), text.count('\n'), len(sentences)

def analyze_sentiment(text):
    blob = TextBlob(text)
    score = blob.sentiment.polarity
    if score > 0.1:
        label = "Positive"
    elif score < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
    return score, label

def sentiment_distribution(text):
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 3]
    pos = neg = neu = 0

    for s in sentences:
        score = TextBlob(s).sentiment.polarity
        if score > 0.1:
            pos += 1
        elif score < -0.1:
            neg += 1
        else:
            neu += 1

    total = max(len(sentences), 1)

    return {
        "Positive": round(pos / total * 100, 1),
        "Neutral": round(neu / total * 100, 1),
        "Negative": round(neg / total * 100, 1)
    }

def topic_modeling(text, num_topics=3):
    try:
        vectorizer = CountVectorizer(stop_words="english", max_features=1000)
        X = vectorizer.fit_transform([text])
        lda = LatentDirichletAllocation(n_components=num_topics, random_state=42)
        lda.fit(X)

        words = vectorizer.get_feature_names_out()
        topics = []

        for topic in lda.components_:
            top_indices = topic.argsort()[-5:]
            top_words = [words[i] for i in top_indices]
            label = top_words[-1].upper()
            topics.append((f"Theme: {label}", ", ".join(reversed(top_words))))

        return topics
    except:
        return [("Theme", "Not enough data")]

def summarize_text(text, sentences=3):
    if len(text.split()) < 20:
        return text
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LexRankSummarizer()
    summary = summarizer(parser.document, sentences)
    return " ".join([str(s) for s in summary])

def generate_wordcloud(text):
    wc = WordCloud(width=800, height=400, background_color="white").generate(text)
    fig, ax = plt.subplots()
    ax.imshow(wc)
    ax.axis("off")
    return fig
