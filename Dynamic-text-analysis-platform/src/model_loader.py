from transformers import pipeline

_bart_model = None

def get_distilbart():
    global _bart_model
    if _bart_model is None:
        print("🔄 Loading DistilBART model (once only)...")
        _bart_model = pipeline(
            "summarization",
            model="sshleifer/distilbart-cnn-12-6",
            device=-1
        )
    return _bart_model
