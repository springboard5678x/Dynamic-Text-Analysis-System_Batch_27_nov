import time
import re
import nltk

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer

from transformers import pipeline


class Summarizer:
    def __init__(self):
        print("🚀 Loading Summarizer...")

        try:
            nltk.download("punkt", quiet=True)
        except:
            pass

        # -------- Extractive Model --------
        self.extractive_model = LexRankSummarizer()

        # -------- Abstractive Model --------
        self.model_name = "sshleifer/distilbart-cnn-12-6"
        # (Optional higher quality)
        # self.model_name = "facebook/bart-large-cnn"

        self.abstractive_pipe = pipeline(
            "summarization",
            model=self.model_name
        )

    # --------------------------------------------------
    # CLEAN INPUT (DO NOT DESTROY STRUCTURE)
    # --------------------------------------------------
    # --------------------------------------------------
    # FIX ENCODING ISSUES (MOJIBAKE)
    # --------------------------------------------------
    def _fix_encoding(self, text: str) -> str:
        # Common cp1252 to utf-8 artifacts
        replacements = {
            'â€™': "'",
            'â€“': "-",
            'â€”': "-",
            'â€œ': '"',
            'â€\x9d': '"',
            'â€˜': "'",
            'â€¢': "*",
            'Â': "",  # Non-breaking space artifact
            'Ã¯': "i",
            'Ã©': "e",
            'â€¦': "..."
        }
        for bad, good in replacements.items():
            text = text.replace(bad, good)
        return text

    # --------------------------------------------------
    # CLEAN INPUT (DO NOT DESTROY STRUCTURE)
    # --------------------------------------------------
    def _clean_for_summary(self, text: str) -> str:
        text = self._fix_encoding(text)
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'\s{2,}', ' ', text)
        return text.strip()

    # --------------------------------------------------
    # REBUILD SENTENCES FROM LEXRANK
    # --------------------------------------------------
    def _rebuild_sentences(self, sentences):
        rebuilt = []
        for s in sentences:
            sent = str(s).strip()

            if not sent:
                continue

            # Ensure minimal punctuation
            if not sent.endswith(('.', '!', '?')):
                sent += '.'

            # Capitalize first letter safely
            if len(sent) > 0:
                sent = sent[0].upper() + sent[1:]
            
            rebuilt.append(sent)

        return " ".join(rebuilt)

    # --------------------------------------------------
    # CHUNK TEXT (CRITICAL FOR BART)
    # --------------------------------------------------
    def _chunk_text(self, text, max_words=500):
        words = text.split()
        for i in range(0, len(words), max_words):
            yield " ".join(words[i:i + max_words])

    # --------------------------------------------------
    # FINAL POLISHING
    # --------------------------------------------------
    def _polish_text(self, text):
        # Ensure spacing after punctuation
        text = re.sub(r'\s+([.,!?])', r'\1', text)
        text = re.sub(r'([.!?])\s*', r'\1 ', text)

        sentences = nltk.sent_tokenize(text)
        # Safe capitalization: Only modify the first character
        sentences = [s[0].upper() + s[1:] if len(s) > 0 else s for s in sentences]

        return " ".join(sentences)


    # --------------------------------------------------
    # MAIN SUMMARIZE FUNCTION
    # --------------------------------------------------
    def summarize(self, text: str) -> dict:
        if not text or len(text) < 150:
            return {"summary": "Not enough text to summarize."}

        start_time = time.time()

        clean_text = self._clean_for_summary(text)

        # -------- PHASE 1: EXTRACTIVE (FAST FILTERING) --------
        # Filter down to key sentences first to save time on abstractive phase
        try:
            parser = PlaintextParser.from_string(
                clean_text,
                Tokenizer("english")
            )
            
            # Cap at 30 sentences for speed/conciseness (approx 500-800 words)
            sentences_count = min(30, len(parser.document.sentences))
            extractive_result = self.extractive_model(
                parser.document,
                sentences_count
            )

            filtered_text = self._rebuild_sentences(extractive_result)

        except Exception as e:
            print(f"Extractive summary failed: {e}")
            filtered_text = clean_text[:3500] 

        # -------- PHASE 2: ABSTRACTIVE (RICH GENERATION) --------
        summaries = []

        # Process chunks
        for chunk in self._chunk_text(filtered_text):
            try:
                # Direct chunk summarization without prefix to avoid leakage
                input_chunk = chunk

                
                output = self.abstractive_pipe(
                    input_chunk,
                    max_length=160,     # Slightly reduced for speed/focus (was 180)
                    min_length=50,      # Reduced to allow concise summaries (was 80)
                    top_k=50,           # Better sampling (default is usually 50)
                    temperature=0.7,    # Slight creativity to sound human
                    do_sample=True,     # Use sampling instead of greedy
                    truncation=True
                )
                summaries.append(output[0]["summary_text"])
            except Exception as e:
                print(f"Chunk summary error: {e}")
                continue

        if not summaries:
            return {"summary": "Summarization failed."}

        final_summary = " ".join(summaries)

        # -------- FINAL POLISH --------
        final_summary = self._polish_text(final_summary)

        print(f"✅ Summary Complete in {time.time() - start_time:.2f}s")

        return {
            "summary": final_summary
        }

