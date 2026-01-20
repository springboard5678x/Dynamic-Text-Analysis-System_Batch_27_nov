import os
import joblib
import pandas as pd
import numpy as np
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BartForConditionalGeneration, BartTokenizer, pipeline
from io import StringIO
import re
from wordcloud import WordCloud, STOPWORDS
import base64
from io import BytesIO
import PyPDF2
import json

# --- KEYWORD OVERRIDES ---
KEYWORD_MAP = {
    'salary': 0, 'pay': 0, 'bonus': 0, 'benefits': 0, '401k': 0, 'compensation': 0,
    'growth': 1, 'promotion': 1, 'career': 1, 'learning': 1, 'training': 1,
    'team': 2, 'office': 2, 'culture': 2, 'colleague': 2, 'environment': 2, 'gym': 2,
    'strategy': 3, 'vision': 3, 'goal': 3, 'brand': 3, 'market': 3,
    'manager': 4, 'management': 4, 'approval': 4, 'process': 4, 'bureaucracy': 4
}

# Initialize Flask
app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---

# Get the directory where app.py is located (backend folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Go up one level to the project root
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# UPDATE THIS DICTIONARY:
PATHS = {
    "summary_model": "sshleifer/distilbart-cnn-12-6",
    # CRITICAL FIX: Use os.path.join to create the full absolute path
    "vectorizer": os.path.join(PROJECT_ROOT, "models", "count_vectorizer.pkl"),
    "sentiment": os.path.join(PROJECT_ROOT, "models", "sentiment_pipeline_v2.pkl"),
    "topic_lda": os.path.join(PROJECT_ROOT, "models", "topic_modeling.pkl")
}

TOPIC_MAP = {
    0: 'Work-Life Balance & Comp',
    1: 'Career Growth & Culture',
    2: 'Team & Office Environment',
    3: 'Business Strategy & Ops',
    4: 'Management & Daily Ops'
}

# --- LOAD MODELS ---
print("⏳ Loading NarrativeNexus models...")
try:
    sentiment_model = joblib.load(PATHS["sentiment"])
    count_vectorizer = joblib.load(PATHS["vectorizer"])
    lda_model = joblib.load(PATHS["topic_lda"])
    tokenizer = BartTokenizer.from_pretrained(PATHS["summary_model"])
    model = BartForConditionalGeneration.from_pretrained(PATHS["summary_model"])
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    print("✅ All Models Loaded Successfully")
except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")
    exit(1)

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

@app.route('/analyze', methods=['POST'])
def analyze():
    # --- Initialize Containers ---
    results = []
    # Structure: {Topic: {'pros': "...", 'cons': "..."}}
    generated_summaries = {v: {'pros': "No data.", 'cons': "No data."} for v in TOPIC_MAP.values()}
    
    sentiment_counts = {'Positive': 0, 'Neutral': 0, 'Negative': 0}
    topic_counts = {v: 0.0 for v in TOPIC_MAP.values()}
    topic_sentiment_matrix = {v: {'Positive': 0, 'Neutral': 0, 'Negative': 0} for v in TOPIC_MAP.values()}
    
    # Separate clusters for Pros and Cons text
    topic_pros_clusters = {v: [] for v in TOPIC_MAP.values()}
    topic_cons_clusters = {v: [] for v in TOPIC_MAP.values()}

    try:
        # A. Parse Input (Updated for CSV, JSON, PDF)
        data = request.json
        raw_content = data.get('content', '')
        file_type = data.get('type', 'csv').lower() # Default to CSV if not sent
        
        processed_reviews = []

        # --- CASE 1: CSV ---
        if file_type == 'csv':
            try:
                df = pd.read_csv(StringIO(raw_content))
                # Normalize column names
                df.columns = [c.lower().strip() for c in df.columns]
                
                if 'pros' in df.columns and 'cons' in df.columns:
                    for _, row in df.iterrows():
                        p, c = str(row['pros']), str(row['cons'])
                        processed_reviews.append({'combined': f"{p}. {c}", 'pros': p, 'cons': c})
                else:
                    # Fallback: Look for 'review' or 'text' or take 1st column
                    text_col = next((c for c in df.columns if c in ['review', 'text']), df.columns[0])
                    for text in df[text_col]:
                        processed_reviews.append({'combined': str(text), 'pros': str(text), 'cons': ''})
            except Exception as e:
                print(f"CSV Error: {e}")

        # --- CASE 2: JSON ---
        elif file_type == 'json':
            try:
                # Expecting a list of dicts: [{"pros": "...", "cons": "..."}, ...] 
                # OR [{"review": "..."}]
                json_data = json.loads(raw_content)
                df = pd.DataFrame(json_data)
                df.columns = [c.lower().strip() for c in df.columns]

                if 'pros' in df.columns and 'cons' in df.columns:
                    for _, row in df.iterrows():
                        p, c = str(row['pros']), str(row['cons'])
                        processed_reviews.append({'combined': f"{p}. {c}", 'pros': p, 'cons': c})
                else:
                    # Fallback logic same as CSV
                    text_col = next((c for c in df.columns if c in ['review', 'text']), df.columns[0])
                    for text in df[text_col]:
                        processed_reviews.append({'combined': str(text), 'pros': str(text), 'cons': ''})
            except Exception as e:
                print(f"JSON Error: {e}")

        # --- CASE 3: PDF (SMART PARSING) ---
        elif file_type == 'pdf':
            try:
                # 1. Decode PDF
                pdf_bytes = base64.b64decode(raw_content)
                pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
                full_text = ""
                for page in pdf_reader.pages:
                    full_text += page.extract_text() + "\n"
                
                # 2. Smart Extraction using Regex
                # We look for patterns like "Pros:\n(text)...Cons:\n(text)..."
                # This matches the specific format of your generated PDF
                import re
                
                # Split by "Review #" to isolate each review block
                # The regex splits the text wherever it sees "Review #1", "Review #2", etc.
                review_blocks = re.split(r'Review #\d+', full_text)
                
                for block in review_blocks:
                    if not block.strip(): continue # Skip empty splits
                    
                    # Extract Pros and Cons using markers
                    pros_match = re.search(r'Pros:\s*(.*?)\s*Cons:', block, re.DOTALL | re.IGNORECASE)
                    cons_match = re.search(r'Cons:\s*(.*?)(?=$|Review #)', block, re.DOTALL | re.IGNORECASE)
                    
                    if pros_match and cons_match:
                        p = pros_match.group(1).strip().replace('\n', ' ')
                        c = cons_match.group(1).strip().replace('\n', ' ')
                        
                        processed_reviews.append({
                            'combined': f"{p}. {c}",
                            'pros': p,
                            'cons': c
                        })
                    else:
                        # Fallback: If standard format fails, treat lines as snippets (but cleaner)
                        lines = [l.strip() for l in block.split('\n') if len(l.strip()) > 20 and "Pros:" not in l and "Cons:" not in l]
                        for l in lines:
                             processed_reviews.append({'combined': l, 'pros': l, 'cons': ''})

            except Exception as e:
                print(f"PDF Error: {e}")

        # Fallback if parsing failed or list is empty
        if not processed_reviews:
            processed_reviews = [{'combined': "Could not parse file.", 'pros': "Error", 'cons': ""}]

        # B. Process Loop
        total = len(processed_reviews)
        
        for i, item in enumerate(processed_reviews):
            text = item['combined']
            clean_t = clean_text(text)
            
            # 1. Sentiment
            try:
                sent_pred = sentiment_model.predict([text])[0]
            except:
                sent_pred = sentiment_model.predict([clean_t])[0]
                
            if isinstance(sent_pred, (int, np.integer)):
                sent_label = {1: "Positive", -1: "Negative"}.get(sent_pred, "Neutral")
            else:
                sent_label = str(sent_pred).capitalize()
            
            sentiment_counts[sent_label] = sentiment_counts.get(sent_label, 0) + 1

            # 2. Topic Detection (Hybrid)
            vec_text = count_vectorizer.transform([clean_t])
            topic_dist = lda_model.transform(vec_text)[0]
            
            forced_topic = None
            for word in clean_t.split():
                if word in KEYWORD_MAP:
                    forced_topic = KEYWORD_MAP[word]
                    break 
            
            if forced_topic is not None:
                primary_topic_idx = forced_topic
                topic_dist = np.zeros(5)
                topic_dist[forced_topic] = 1.0
            else:
                primary_topic_idx = topic_dist.argmax()

            primary_topic_name = TOPIC_MAP.get(primary_topic_idx, "General")
            
            # Accumulate Metrics
            for idx, prob in enumerate(topic_dist):
                t_name = TOPIC_MAP.get(idx, "General")
                if t_name in topic_counts:
                    topic_counts[t_name] += float(prob)

            topic_sentiment_matrix[primary_topic_name][sent_label] += 1

            # 3. Add to Clusters (SPLIT LOGIC)
            if len(item['pros']) > 3: 
                topic_pros_clusters[primary_topic_name].append(item['pros'])
            if len(item['cons']) > 3:
                topic_cons_clusters[primary_topic_name].append(item['cons'])

            results.append({
                "id": i,
                "snippet": text[:100] + "...",
                "topic": primary_topic_name,
                "sentiment": sent_label
            })

        # C. Generate Summaries (Double Pass - OPTIMIZED)
        print("📝 Generating Dual Summaries...")
        for topic in TOPIC_MAP.values():
            # Summarize Pros
            p_list = topic_pros_clusters[topic]
            c_list = topic_cons_clusters[topic]
            
            p_summary = "No significant positive feedback."
            c_summary = "No significant negative feedback."
            
            if len(p_list) > 0:
                random.shuffle(p_list)
                # CHANGE: Use only top 5 reviews (was 15)
                combined_p = " ".join(p_list[:5])
                try:
                    # CHANGE: Reduced max_length to 50 (was 60)
                    p_summary = summarizer(combined_p, max_length=50, min_length=15, do_sample=False)[0]['summary_text']
                except: pass
                
            if len(c_list) > 0:
                random.shuffle(c_list)
                # CHANGE: Use only top 5 reviews
                combined_c = " ".join(c_list[:5])
                try:
                    # CHANGE: Reduced max_length to 50
                    c_summary = summarizer(combined_c, max_length=50, min_length=15, do_sample=False)[0]['summary_text']
                except: pass
            
            generated_summaries[topic] = {'pros': p_summary, 'cons': c_summary}

        # D. Normalize Stats & Generate Word Cloud
        wordcloud_image = None # Default if no data

        if total > 0:
            pos_pct = round((sentiment_counts['Positive'] / total) * 100)
            top_topic = max(topic_counts, key=topic_counts.get)
            normalized_topic_counts = {k: round((v / total) * 100) for k, v in topic_counts.items()}
            
            # --- WORD CLOUD FIX ---
            # Gather text from BOTH Pros and Cons clusters for the top topic
            # We must use the new list names: topic_pros_clusters and topic_cons_clusters
            pros_text = " ".join(topic_pros_clusters[top_topic])
            cons_text = " ".join(topic_cons_clusters[top_topic])
            top_topic_text = pros_text + " " + cons_text
            
            # Generate Cloud if text exists
            if len(top_topic_text) > 0:
                try:
                    # Create WordCloud object
                    wc = WordCloud(width=800, height=400, background_color='#1e293b', 
                                   colormap='viridis', stopwords=STOPWORDS).generate(top_topic_text)
                    
                    # Save to buffer
                    img = BytesIO()
                    wc.to_image().save(img, format='PNG')
                    img.seek(0)
                    
                    # Convert to Base64 string
                    wordcloud_image = "data:image/png;base64," + base64.b64encode(img.getvalue()).decode('utf-8')
                except Exception as e:
                    print(f"WordCloud Error: {e}")
                    wordcloud_image = None
            # ----------------------------------

        else:
            pos_pct, top_topic, normalized_topic_counts = 0, "None", {}

        return jsonify({
            "new_entries": results,
            "dashboard_stats": {
                "total_reviews": total,
                "positive_pct": pos_pct,
                "top_topic": top_topic,
                "sentiment_counts": sentiment_counts,
                "topic_counts": normalized_topic_counts,
                "topic_sentiment_matrix": topic_sentiment_matrix,
                "executive_summaries": generated_summaries,
                "wordcloud_image": wordcloud_image  # <--- Sending to Frontend
            }
        })

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)