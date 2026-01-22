import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer


stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    # 1. Lowercase
    text = text.lower()

    # 2. Remove URLs
    text = re.sub(r"http\S+|www\S+", "", text)

    # 3. Remove special characters, numbers, emojis
    text = re.sub(r"[^a-zA-Z\s]", " ", text)

    custom_stopwords = {
    'org', 'care', 'provide', 'email', 'used','like','world','update','expert'
}

    # 4. Tokenization
    tokens = word_tokenize(text)

    # 5. Remove stopwords and short words
    tokens = [t for t in tokens if t not in stop_words and t not in custom_stopwords and len(t) > 2]

    # 6. Lemmatization
    tokens = [lemmatizer.lemmatize(t) for t in tokens]

    # 7. Convert tokens back to text
    clean_text = " ".join(tokens)

    return clean_text
