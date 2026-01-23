import io
import pandas as pd
from typing import Tuple

try:
    from docx import Document
except ImportError:
    Document = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from typing import Tuple, Dict, Any

def extract_text_from_file(file_content: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text from various file formats based on filename extension.
    Returns (extracted_text, metadata).
    """
    filename = filename.lower()
    meta = {}
    
    # 1. DOCX
    if filename.endswith('.docx'):
        if Document is None:
            return "Error: python-docx not installed.", meta
        try:
            doc = Document(io.BytesIO(file_content))
            return "\n".join([para.text for para in doc.paragraphs]), meta
        except Exception as e:
            return f"Error reading .docx file: {e}", meta

    # 2. PDF
    elif filename.endswith('.pdf'):
        if PdfReader is None:
             return "Error: pypdf not installed.", meta
        try:
            reader = PdfReader(io.BytesIO(file_content))
            return "\n".join([page.extract_text() for page in reader.pages]), meta
        except Exception as e:
            return f"Error reading .pdf file: {e}", meta

    # 3. CSV
    elif filename.endswith('.csv'):
        try:
            # Try utf-8 then latin-1
            try:
                text_content = file_content.decode('utf-8')
            except UnicodeDecodeError:
                text_content = file_content.decode('latin-1')
            
            df = pd.read_csv(io.StringIO(text_content))
            meta["csv_rows"] = len(df)
            meta["csv_cols"] = len(df.columns)
            
            potential_cols = ['clean_text', 'text', 'tweet', 'content', 'review', 'comment']
            target_col = next((c for c in potential_cols if c in df.columns), None)
            
            if target_col:
                return "\n".join(df[target_col].astype(str).tolist()), meta
            else:
                # If no target column found, just dump the whole CSV as text or first column
                return "\n".join(df.iloc[:, 0].astype(str).tolist()), meta
        except Exception as e:
            return f"Error reading .csv file: {e}", meta

    # 4. Plain Text (default)
    else:
        try:
            return file_content.decode('utf-8'), meta
        except UnicodeDecodeError:
            try:
                return file_content.decode('latin-1'), meta
            except Exception as e:
                return f"Error decoding text file: {e}", meta
