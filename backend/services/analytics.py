from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from typing import List, Dict, Any
import re
import nltk
from langdetect import detect, LangDetectException

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

import io
import base64
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt

class AnalyticsService:

    def __init__(self):
        pass

    def get_text_stats(self, text: str) -> Dict[str, Any]:
        """
        Calculates basic text statistics.
        """
        words = text.split()
        num_chars = len(text)
        num_words = len(words)
        
        try:
            sentences = nltk.sent_tokenize(text)
            num_sentences = len(sentences)
            # If NLTK returns 1 massive sentence, trying simple newline split
            if num_sentences < 2:
                 split_lines = [s for s in text.split('\n') if s.strip()]
                 if len(split_lines) > 1:
                     num_sentences = len(split_lines)

        except:
            # Fallback
            sentences = re.split(r'[.!?]+', text)
            num_sentences = len([s for s in sentences if s.strip()])


        
        avg_word_len = sum(len(w) for w in words) / num_words if num_words > 0 else 0
        
        try:
            language = detect(text)
        except LangDetectException:
            language = "unknown"

        return {
            "char_count": num_chars,
            "word_count": num_words,
            "sentence_count": num_sentences,
            "avg_word_length": round(avg_word_len, 2),
            "language": language
        }

    def get_ngrams(self, text: str, n: int = 2, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Extracts top N-grams (phrases) from the text.
        """
        if not text.strip():
            return []
            
        try:
            # Using CountVectorizer for efficient n-gram extraction
            # Removing stop words for better quality phrases
            vectorizer = CountVectorizer(ngram_range=(n, n), stop_words='english', max_features=1000)
            X = vectorizer.fit_transform([text])
            
            # Summing up counts (though for 1 doc it's just the row)
            counts = X.toarray().flatten()
            feature_names = vectorizer.get_feature_names_out()
            
            # Zip and sort
            ngram_counts = list(zip(feature_names, counts))
            ngram_counts.sort(key=lambda x: x[1], reverse=True)
            
            # Format top_k
            return [{"phrase": phrase, "count": int(count)} for phrase, count in ngram_counts[:top_k]]
        except ValueError:
            # Handle cases like empty vocabulary or stop words issues
            return []
        except Exception as e:
            print(f"Error extracting n-grams: {e}")
            return []

    def get_top_keywords(self, text: str, top_k: int = 20) -> List[Dict[str, Any]]:
        """
        Extracts top unigrams for Bar Charts.
        """
        return self.get_ngrams(text, n=1, top_k=top_k)

    def get_word_cloud_image(self, text: str) -> str:
        """
        Generates a Word Cloud image (base64) matching user's specific style.
        """
        try:
            # User specified custom stopwords
            custom_stops = set(STOPWORDS).union(set(nltk.corpus.stopwords.words('english')))
            custom_stops.update(['user', 'rt', 'url', 'lol', 'im']) 

            # User specified cleaning
            cleaned_text = re.sub(r'[^a-z\s]', '', text.lower())

            if not cleaned_text.strip():
                return ""

            wc = WordCloud(
                width=800, 
                height=400, 
                background_color='white',
                stopwords=custom_stops, 
                min_font_size=10, 
                colormap='magma'
            ).generate(cleaned_text)
            
            buffer = io.BytesIO()
            wc.to_image().save(buffer, format="PNG")
            return base64.b64encode(buffer.getvalue()).decode()

        except Exception as e:
            print(f"WordCloud generation failed: {e}")
            return ""



    def _count_syllables(self, word: str) -> int:
        word = word.lower()
        count = 0
        vowels = "aeiouy"
        if word[0] in vowels:
            count += 1
        for index in range(1, len(word)):
            if word[index] in vowels and word[index - 1] not in vowels:
                count += 1
        if word.endswith("e"):
            count -= 1
        if count == 0:
            count += 1
        return count

    def get_readability_metrics(self, text: str, stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates Reading Time, Complexity (Flesch), and Lexical Diversity.
        """
        word_count = stats["word_count"]
        sentence_count = stats["sentence_count"]
        
        if word_count == 0 or sentence_count == 0:
            return {
                "reading_time_min": 0,
                "complexity_score": 0,
                "complexity_label": "N/A",
                "lexical_diversity": 0
            }

        #Reading Time (avg 200 words/min)
        reading_time = round(word_count / 200, 1)

        #Lexical Diversity (Type-Token Ratio)
        words = text.split()
        unique_words = len(set([w.lower() for w in words]))
        lexical_diversity = round((unique_words / word_count) * 100, 1) if word_count > 0 else 0

        #Flesch Reading Ease
        #Formula: 206.835 - 1.015 (total_words / total_sentences) - 84.6 (total_syllables / total_words)
        total_syllables = sum(self._count_syllables(w) for w in words)
        
        flesch_score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (total_syllables / word_count)
        
        # Complexity Label
        if flesch_score > 80: label = "Very Easy (Elementary)"
        elif flesch_score > 60: label = "Standard (Plain English)"
        elif flesch_score > 30: label = "Fairly Difficult (College)"
        else: label = "Very Diffcult (Academic/Scientific)"

        return {
            "reading_time_min": reading_time,
            "complexity_score": round(flesch_score, 1),
            "complexity_label": label,
            "lexical_diversity": lexical_diversity
        }

    def analyze(self, text: str) -> Dict[str, Any]:
        stats = self.get_text_stats(text)
        readability = self.get_readability_metrics(text, stats)
        
        return {
            "stats": stats,
            "readability": readability,
            "bigrams": self.get_ngrams(text, n=2, top_k=10),
            "trigrams": self.get_ngrams(text, n=3, top_k=10),
            "top_keywords": self.get_top_keywords(text, top_k=20),
            "word_cloud_image": self.get_word_cloud_image(text)
        }

