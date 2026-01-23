from typing import List, Dict, Any
from transformers import pipeline
import numpy as np
import torch
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

class IntelligenceService:
    def __init__(self):
        # Initialize NER pipeline (lazy loading recommended, but here we init in constructor)
        # Using a small, fast model for NER to ensure speed
        device = 0 if torch.cuda.is_available() else -1
        try:
            self.ner_pipeline = pipeline(
                "ner", 
                model="dslim/bert-base-NER", 
                aggregation_strategy="simple",
                device=device
            )
            print("✅ Intelligence Service (NER) Initialized.")
        except Exception as e:
            print(f"⚠️ NER Pipeline Init Failed: {e}. Entity extraction will be disabled.")
            self.ner_pipeline = None

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extracts entities (ORG, PER, LOC, MISC) from text.
        """
        if not self.ner_pipeline or not text:
            return {}

        # Limit text length for NER to avoid OOM/Timeout
        # Process first 2000 characters for "At a glance" entities
        short_text = text[:3000] 
        
        try:
            entities = self.ner_pipeline(short_text)
            
            # Group by type
            grouped = {
                "ORG": set(),
                "PER": set(),
                "LOC": set(),
                "MISC": set()
            }
            
            for ent in entities:
                label = ent['entity_group']
                word = ent['word']
                if label in grouped:
                    grouped[label].add(word)
            
            # Convert sets to sorted lists
            return {k: sorted(list(v)) for k, v in grouped.items()}
        except Exception as e:
            print(f"Error in NER extraction: {e}")
            return {}

    def extract_key_highlights(self, text: str, count: int = 5) -> List[str]:
        """
        Extracts top 'count' critical sentences verbatim (Extractive Summarization).
        """
        if not text: return []
        
        # FIX: Truncate input to avoid MemoryError (6GB+ allocations) on large files
        # 100k chars is plenty for highlights.
        if len(text) > 100000:
            text = text[:100000]

        
        try:
            parser = PlaintextParser.from_string(text, Tokenizer("english"))
            summarizer = LsaSummarizer()
            summary_sentences = summarizer(parser.document, count)
            return [str(s) for s in summary_sentences]
        except Exception as e:
            print(f"Error in Highlights extraction: {e}")
            return []
