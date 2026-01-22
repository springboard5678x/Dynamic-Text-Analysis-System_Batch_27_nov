from src.model_loader import get_distilbart

def distilbart_summarize(text, max_length=220, min_length=80):
    text = " ".join(text.split()[:900])

    if len(text.split()) < 50:
        return ["Text too short to summarize"]

    summarizer = get_distilbart()

    summary = summarizer(
        text,
        max_length=max_length,
        min_length=min_length,
        do_sample=False
    )

    return [summary[0]["summary_text"]]
