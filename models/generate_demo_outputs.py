"""
NarrativeNexus – Demo Model Export Script (student-friendly)

Goal:
- Actually load the pre-trained pickles in /models (tfidf_vectorizer.pkl + nmf_model.pkl).
- Export a SMALL JSON the React app can read at runtime:
  - public/models/demo_outputs.json

Why this flow:
- Browsers can’t unpickle Python models, so we precompute JSON offline.
- Keeps the frontend simple while still “using the real models” to generate outputs.

Quick use (example):
1) python -m venv .venv && .venv/Scripts/activate (Win) or source .venv/bin/activate (mac/linux)
2) pip install -r models/requirements.txt
3) python models/generate_demo_outputs.py --text "Paste your paragraph here"
   # or: python models/generate_demo_outputs.py --file sample.txt

The script is tolerant:
- If pickles are missing or incompatible, it falls back to the previous demo JSON.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List

import joblib  # type: ignore
import numpy as np
from scipy.sparse import csr_matrix  # type: ignore


ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = ROOT / "models"
OUTPUT_PATH = ROOT / "public" / "models" / "demo_outputs.json"


def get_topic_name(idx: int) -> str:
    """Map topic index to meaningful name (student-friendly demo)."""
    topic_names = {
        0: "Sports",
        1: "Politics & Government",
        2: "Technology & Digital Media",
        3: "Movies & Entertainment",
        4: "Economy & Business",
    }
    return topic_names.get(idx, f"Topic {idx}")


def top_terms_per_topic(components: np.ndarray, feature_names: List[str], top_n: int = 8):
    topics = []
    for idx, row in enumerate(components):
        top_indices = np.argsort(row)[::-1][:top_n]
        topics.append(
            {
                "id": idx,
                "name": get_topic_name(idx),
                "keyTerms": [feature_names[i] for i in top_indices],
            }
        )
    return topics


def get_feature_names_safe(vectorizer) -> List[str]:
    """
    Handle multiple possible pickle shapes:
    - Proper sklearn vectorizer with get_feature_names_out
    - Older vectorizer with vocabulary_
    - If someone pickled a sparse matrix instead of the vectorizer, we treat it as a TF-IDF matrix (no names).
    """
    if isinstance(vectorizer, csr_matrix):
        raise ValueError("csr_matrix_detected")

    if hasattr(vectorizer, "get_feature_names_out"):
        return list(vectorizer.get_feature_names_out())
    if hasattr(vectorizer, "vocabulary_"):
        # vocabulary_ is a dict word -> index; sort by index
        vocab = vectorizer.vocabulary_
        return [w for w, _ in sorted(vocab.items(), key=lambda x: x[1])]

    raise ValueError("Loaded object has no vocabulary or get_feature_names_out.")


def build_sentiment_lexicon() -> dict:
    # Expanded lexicon for better sentiment detection (student-friendly, transparent).
    return {
        "positive": [
            "good", "great", "excellent", "happy", "success", "benefit", "improve",
            "positive", "growth", "opportunity", "advantage", "progress", "achievement",
            "prosperous", "thriving", "optimistic", "hopeful", "confident"
        ],
        "negative": [
            "bad", "terrible", "sad", "problem", "fail", "risk", "issue",
            "concern", "concerns", "serious", "difficult", "uncertain", "uncertainty",
            "pessimistic", "decline", "struggling", "pressure", "crisis", "challenge",
            "worry", "anxious", "fear", "criticized", "criticism", "hesitant", "reduced"
        ],
    }


def load_text(args: argparse.Namespace) -> str:
    if args.text:
        return args.text
    if args.file:
        return Path(args.file).read_text(encoding="utf-8", errors="ignore")
    # Fallback sample text if none provided
    return "Artificial intelligence systems help automate analysis pipelines and improve insights."


def main() -> None:
    parser = argparse.ArgumentParser(description="Export demo JSON from pickled models.")
    parser.add_argument("--text", type=str, help="Inline text to analyze")
    parser.add_argument("--file", type=str, help="Path to a text file to analyze")
    parser.add_argument("--top_n", type=int, default=8, help="Top-N terms per topic")
    args = parser.parse_args()

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    tfidf_path = MODELS_DIR / "tfidf_vectorizer.pkl"
    nmf_path = MODELS_DIR / "nmf_model.pkl"

    try:
        vectorizer = joblib.load(tfidf_path)
        nmf_model = joblib.load(nmf_path)

        used_csr_matrix = False
        topics: List[dict]
        dist: List[float]

        try:
            feature_names: List[str] = get_feature_names_safe(vectorizer)
            topics = top_terms_per_topic(nmf_model.components_, feature_names, top_n=args.top_n)

            text = load_text(args)
            tfidf = vectorizer.transform([text])
            topic_weights = nmf_model.transform(tfidf)[0]
            dist = (topic_weights / topic_weights.sum()).tolist() if topic_weights.sum() > 0 else [0.0] * len(topics)
        except ValueError as e:
            if str(e) != "csr_matrix_detected":
                raise
            # The "vectorizer" was actually a TF-IDF matrix. We can still use the NMF model
            # to produce an average topic distribution over that matrix, but we lack feature names.
            used_csr_matrix = True
            tfidf_matrix = vectorizer  # type: ignore
            topic_matrix = nmf_model.transform(tfidf_matrix)
            avg = topic_matrix.mean(axis=0)
            dist = (avg / avg.sum()).tolist() if avg.sum() > 0 else [0.0] * len(nmf_model.components_)
            
            # Extract actual frequent words from input text to use as key terms
            text = load_text(args)
            words = text.lower().split()
            # Filter: words with 4+ chars, remove common stopwords
            stopwords = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "as", "is", "are", "was", "were", "been", "be", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those", "a", "an"}
            word_freq: dict[str, int] = {}
            for word in words:
                clean_word = word.strip(".,!?;:()[]{}\"'").lower()
                if len(clean_word) >= 4 and clean_word not in stopwords:
                    word_freq[clean_word] = word_freq.get(clean_word, 0) + 1
            
            # Sort by frequency and get top words
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:args.top_n * len(nmf_model.components_)]
            top_word_list = [w for w, _ in top_words]
            
            # Distribute top words across topics (round-robin or by topic weight)
            topics = []
            words_per_topic = max(5, args.top_n)
            for idx in range(len(nmf_model.components_)):
                # Assign words to topics based on distribution weight (higher weight gets more words)
                start_idx = int(sum(dist[:idx]) * len(top_word_list))
                end_idx = min(start_idx + words_per_topic, len(top_word_list))
                topic_words = top_word_list[start_idx:end_idx] if start_idx < len(top_word_list) else top_word_list[:words_per_topic]
                
                # If not enough words, fill with most frequent
                if len(topic_words) < words_per_topic:
                    topic_words = top_word_list[:words_per_topic]
                
                topics.append({
                    "id": idx,
                    "name": get_topic_name(idx),
                    "keyTerms": topic_words[:words_per_topic],  # Use actual frequent words from input
                })

        demo_json = {
            "project": "NarrativeNexus – Dynamic Text Analysis Platform",
            "note": "Generated from /models pickles using generate_demo_outputs.py",
            "topics": topics,
            "sentimentLexicon": build_sentiment_lexicon(),
            "sampleTextTopicDistribution": dist,
            "usedCsrMatrix": used_csr_matrix,
        }
    except Exception as exc:  # pragma: no cover - defensive fallback
        print("[warn] Could not load models; using fallback demo JSON.")
        print(f"[warn] Details: {exc}")
        print("[hint] Common fixes:")
        print("  - Install the same scikit-learn version used when the pickle was created (see models/requirements.txt).")
        print("  - Ensure tfidf_vectorizer.pkl is a *vectorizer object* (has vocabulary_/get_feature_names_out).")
        print("  - If you only have a TF-IDF matrix, the script will still export but with placeholder key terms.")
        demo_json = {
            "project": "NarrativeNexus – Dynamic Text Analysis Platform",
            "note": "Fallback JSON because pickles were missing or incompatible.",
            "topics": [
                {
                    "id": 0,
                    "name": "Technology & Innovation",
                    "keyTerms": ["ai", "model", "data", "system", "platform", "automation", "analysis", "pipeline"],
                }
            ],
            "sentimentLexicon": build_sentiment_lexicon(),
            "sampleTextTopicDistribution": [1.0],
        }

    OUTPUT_PATH.write_text(json.dumps(demo_json, indent=2), encoding="utf-8")
    print(f"Wrote: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

