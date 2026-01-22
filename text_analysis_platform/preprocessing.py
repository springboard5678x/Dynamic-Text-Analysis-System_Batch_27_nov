import string
from nltk.corpus import stopwords
from nltk.tokenize import wordpunct_tokenize
import nltk

nltk.download('stopwords')

def preprocess_text(text):
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    tokens = wordpunct_tokenize(text)
    stop_words = set(stopwords.words("english"))
    tokens = [w for w in tokens if w.isalpha() and w not in stop_words]
    return tokens
