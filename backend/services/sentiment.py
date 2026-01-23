from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict, Any

class SentimentAnalyzer:
    def __init__(self):
        # High Accuracy 3-Class Model (Positive, Neutral, Negative)
        # This replaces the binary SST-2 model you used before.
        self.model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
        print(f"Loading 3-Class Sentiment Model: {self.model_name}...")
        
        device = 0 if torch.cuda.is_available() else -1
        # use_safetensors=True fixes the PyTorch security warning
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.model_name, use_safetensors=True
        )
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
        self.pipeline = pipeline(
            "sentiment-analysis", 
            model=self.model, 
            tokenizer=self.tokenizer, 
            device=device,
            top_k=None # Return scores for all classes
        )

    def predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        if not texts: return []
        
        try:
            # Analyze in batch (Truncate to 512 tokens to prevent crashes)
            results = self.pipeline(texts, truncation=True, max_length=512)
            processed = []
            
            for text, res in zip(texts, results):
                # res is a list of dicts [{'label': 'positive', 'score': 0.9}, ...]
                # Find the label with the highest score
                top_result = max(res, key=lambda x: x['score'])
                
                processed.append({
                    "text": text,
                    "label": top_result['label'].lower(), # 'positive', 'neutral', 'negative'
                    "score": top_result['score']
                })
            return processed
        except Exception as e:
            print(f"Sentiment Error: {e}")
            return []

    def get_distribution(self, predictions):
        if not predictions: return {"positive": 0, "neutral": 0, "negative": 0}
        
        labels = [p['label'] for p in predictions]
        total = len(labels)
        if total == 0: return {"positive": 0, "neutral": 0, "negative": 0}

        return {
            "positive": round(labels.count("positive") / total, 2),
            "neutral": round(labels.count("neutral") / total, 2),
            "negative": round(labels.count("negative") / total, 2)
        }

    def calculate_net_sentiment_score(self, distribution: Dict[str, float]) -> float:
        """
        Calculates Net Sentiment Score (-1 to 1).
        Formula: Positive - Negative
        """
        return round(distribution.get("positive", 0) - distribution.get("negative", 0), 2)


    def predict_trend(self, text: str, num_chunks=10):
        # Simple trend analysis by splitting text into chunks
        if not text: return []
        n = len(text)
        chunk_size = max(1, n // num_chunks)
        chunks = [text[i:i+chunk_size] for i in range(0, n, chunk_size)][:num_chunks]
        
        preds = self.predict(chunks)
        scores = []
        for p in preds:
            val = p['score']
            if p['label'] == 'negative': val = -val
            elif p['label'] == 'neutral': val = 0
            scores.append(val)
        return scores