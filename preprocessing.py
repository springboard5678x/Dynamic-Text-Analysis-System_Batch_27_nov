import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

nltk.download("punkt", quiet=True)
nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def remove_special_chars(text):
    return re.sub(r'[^a-zA-Z0-9.\s]', '', text)

def preprocess_text(text, remove_space=True, remove_special=True, stopword_flag=True, lemma_flag=True):
    if remove_space:
        text = clean_text(text)
    if remove_special:
        text = remove_special_chars(text)

    tokens = word_tokenize(text.lower())

    if stopword_flag:
        sw = set(stopwords.words("english"))
        tokens = [t for t in tokens if t not in sw and len(t) > 2]

    if lemma_flag:
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(t) for t in tokens]

    return " ".join(tokens)

def preprocess_for_summary(text, use_lemma=False):
    text = re.sub(r"\s+", " ", text)
    if use_lemma:
        tokens = word_tokenize(text)
        lemmatizer = WordNetLemmatizer()
        text = " ".join(lemmatizer.lemmatize(t) for t in tokens)
    return text.strip()
