import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import pandas as pd

# Download necessary NLTK data lazily/on import
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)
try:
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('omw-1.4', quiet=True)

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()


# Common contractions map
CONTRACTIONS = {
    "n't": " not", "'re": " are", "'s": " is", "'d": " would", "'ll": " will",
    "'t": " not", "'ve": " have", "'m": " am"
}

def clean_text(text: str) -> str:
    """
    Cleans the input text by:
    1. Lowercasing
    2. Extending contractions
    3. Removing URLs, Emails, Mentions
    4. Removing special characters
    5. Lemmatizing
    """
    if not text or pd.isna(text):
        return ""
    
    # 1. Lowercase
    text = str(text).lower()
    
    # 2. URLs and Emails
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\S+@\S+', '', text)
    
    # 3. Hashtags and Mentions
    text = re.sub(r'@[A-Za-z0-9_]+', '', text)
    text = re.sub(r'#[A-Za-z0-9_]+', '', text)
    
    # 4. Fix Contractions
    for contraction, expansion in CONTRACTIONS.items():
        text = text.replace(contraction, expansion)
        
    # 5. Remove special characters (keep logic simple)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # 6. Tokenize & Lemmatize
    words = text.split()
    clean_words = []
    
    # Use set for faster lookup
    for w in words:
        if w not in stop_words and len(w) > 2:
            root_word = lemmatizer.lemmatize(w)
            clean_words.append(root_word)
            
    return " ".join(clean_words)
