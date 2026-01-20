import chardet
import io
import pandas as pd
import docx

ALLOWED_EXTENSIONS = {"txt", "csv", "docx"}

def read_file(uploaded_file):
    """
    Reads an uploaded file and extracts text content.
    Supports: .txt, .csv, .docx
    Returns extracted text as a string.
    """
    if uploaded_file is None:
        raise ValueError("No file uploaded.")

    name = uploaded_file.name.lower()
    ext = name.split('.')[-1]
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Read raw bytes
    try:
        raw = uploaded_file.read()
    except Exception as e:
        raise ValueError(f"Error reading file: {str(e)}")

    if not raw:
        raise ValueError("File is empty.")
    
    # Handle txt
    if ext == "txt":
        encoding = chardet.detect(raw).get("encoding") or 'utf-8'
        return raw.decode(encoding, errors = "ignore")
    
    # Handle csv
    elif ext == "csv":
        try:
            df = pd.read_csv(io.BytesIO(raw))
            if df.empty:
                raise ValueError("CSV file is empty.")

            # Prefer 'Text' column
            if "Text" in df.columns:
                return "\n\n".join(df["Text"].dropna().astype(str).tolist())
            
            # Else first string column
            string_cols = [col for col in df.columns if df[col].dtype == object]
            if string_cols:
                return "\n\n".join(df[string_cols[0]].dropna().astype(str).tolist())

            # Fallback: return entire dataframe
            return df.to_string()

        except Exception:
            return raw.decode("utf-8", errors="ignore")
        
    # Handle docx
    elif ext == "docx":
        try:
            doc = docx.Document(io.BytesIO(raw))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:
            raise ValueError(f"Error processing DOCX file: {str(e)}")

    raise ValueError("Unexpected error in file processing.")

def basic_checks(text, min_chars = 50, min_words = 10):
    """
    Performs basic validation checks on extracted text.
    - Minimum character length
    - Noise check (ratio of alphanumeric characters)
    Returns (True, "OK") if valid, else (False, reason).
    """
    if not text or not text.strip():
        return False, "Text is empty or whitespace only."

    if len(text.strip()) < min_chars:
        return False, f"Text too short. Minimum {min_chars} characters required."

    if len(text.split()) < min_words:
        return False, f"Text too short. Minimum {min_words} words required."

    alpha_count = sum(c.isalnum() for c in text)
    ratio = alpha_count / max(1, len(text))
    if ratio < 0.2:
        return False, "Text appears noisy or non-alphanumeric."

    if "�" in text:
        return False, "Text contains undecodable characters."

    return True, "OK"
