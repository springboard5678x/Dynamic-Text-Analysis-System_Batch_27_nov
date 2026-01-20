import torch
import re
from transformers import BartForConditionalGeneration, BartTokenizer
from functools import lru_cache

MODEL_NAME = "facebook/bart-large-cnn"
MAX_INPUT_TOKENS = 1024  # BART encoder limit

@lru_cache(maxsize=1)
def load_bart_model():
    tokenizer = BartTokenizer.from_pretrained(MODEL_NAME)
    model = BartForConditionalGeneration.from_pretrained(MODEL_NAME)
    device = "cpu"

    model.to(device)
    model.eval()  # set to eval mode for generation
    return tokenizer, model, device

def sanitize_text(text):
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    text = re.sub(r"<[^>]+>", " ", text) # Remove HTML tags
    cleaned = " ".join(text.strip().split())
    return cleaned

def summarize_text(text, min_length=20, max_length=50, num_beams=4, length_penalty=1.5, no_repeat_ngram_size=3, seed=None):
    tokenizer, model, device = load_bart_model()
    if seed is not None:
        torch.manual_seed(seed)

    text = sanitize_text(text)
    if not text or len(text) < 20:
        return "Text too short to summarize."

    inputs = tokenizer(
        [text], 
        max_length=MAX_INPUT_TOKENS, 
        return_tensors="pt", 
        truncation=True
    )
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs.get("attention_mask", None)
    if attention_mask is not None:
        attention_mask = attention_mask.to(device)

    # Generate Summary
    with torch.inference_mode():
        summary_ids = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            num_beams=num_beams,
            min_length=min_length,
            max_length=max_length,
            length_penalty=length_penalty,
            early_stopping=True,
            no_repeat_ngram_size=no_repeat_ngram_size
        )
    
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary
