from transformers import pipeline
import torch
from typing import List, Dict

class InsightsGenerator:
    def __init__(self):
        self.model_name = "cross-encoder/nli-deberta-v3-small"

        self.model_name = "sileod/deberta-v3-base-tasksource-nli"
        print(f"Loading Insights Model (DeBERTa): {self.model_name}...")
        
        device = 0 if torch.cuda.is_available() else -1

        self.classifier = pipeline("zero-shot-classification", model=self.model_name, device=device)
        print("Insights Model Loaded.")

    def generate_insights(self, text: str) -> Dict[str, any]:
        """
        Extracts strategic insights using Zero-Shot Classification.
        """
        if not text.strip():
            return {}

        results = {}
        
        # Insight 1: Intent/Category
        candidate_labels = ["Complaint", "Suggestion", "Praise", "Inquiry", "Urgent Issue"]
        intent_res = self.classifier(text, candidate_labels)
        results['intent'] = {
            "label": intent_res['labels'][0],
            "score": intent_res['scores'][0]
        }

        # Insight 2: Actionability
        action_labels = ["Actionable", "Informational", "Irrelevant"]
        action_res = self.classifier(text, action_labels)
        results['actionability'] = {
            "label": action_res['labels'][0],
            "score": action_res['scores'][0]
        }
        
        # Insight 3: Urgency
        urgency_labels = ["High Urgency", "Medium Urgency", "Low Urgency"]
        urgency_res = self.classifier(text, urgency_labels)
        results['urgency'] = {
            "label": urgency_res['labels'][0],
            "score": urgency_res['scores'][0]
        }

        return results

    def extract_risk_opportunity(self, text: str) -> List[Dict[str, str]]:
        """
        Scans sentences for Risk vs Opportunity keywords.
        Returns a list of flags.
        """
        import re
        sentences = re.split(r'[.!?]+', text)
        flags = []
        
        risks = ["risk", "danger", "fail", "error", "delay", "loss", "threat", "concern", "issue", "problem", "critical"]
        opps = ["opportunity", "growth", "potential", "benefit", "gain", "profit", "win", "success", "leverage", "advantage"]
        
        for sent in sentences:
            sent_str = sent.strip().lower()
            if not sent_str or len(sent_str.split()) < 4: continue
            
            # Check Risk
            if any(r in sent_str for r in risks):
                flags.append({"type": "Risk", "text": sent.strip(), "level": "High"})
                continue
                
            # Check Opportunity
            if any(o in sent_str for o in opps):
                flags.append({"type": "Opportunity", "text": sent.strip(), "level": "Medium"})
                
        return flags[:10] # Return top 10

    def calculate_urgency_score(self, text: str) -> int:
        """
        Calculates Urgency Score (1-10) based on keywords.
        """
        text_lower = text.lower()
        keywords = ["urgent", "immediate", "critical", "deadline", "asap", "priority", "alert", "emergency", "soon", "required"]
        
        count = sum(1 for k in keywords if k in text_lower)
        
        # Base score 1. Add 2 for each keyword. Cap at 10.
        score = 1 + (count * 2)
        return min(10, score)
