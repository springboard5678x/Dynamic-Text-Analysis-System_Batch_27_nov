import os
import re
import pickle
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
from wordcloud import WordCloud

import spacy
from gensim.models import LdaModel
from gensim.corpora import Dictionary
from gensim.utils import simple_preprocess

from nltk.corpus import stopwords

import plotly.express as px
import plotly.graph_objects as go

from validation import read_file, basic_checks
from summarizer import summarize_text
from reporting import build_docx_report, generate_insights_and_recommendations

st.set_page_config(
    layout="wide",
    page_title="Text Analysis Platform",
    page_icon="🧠"
)

px.defaults.template = "plotly_dark"
px.defaults.color_continuous_scale = "Blues"

APP_CSS = """
<style>
/* Global */
:root {
  --bg1: #0f2027;
  --bg2: #203a43;
  --bg3: #2c5364;
  --card: #16232d;
  --card2: #1b2a35;
  --text: #f5f7fa;
  --muted: #cfe3f0;
  --accent1: #ff8c00;
  --accent2: #ff3d00;
  --border: rgba(255,255,255,0.12);
}

html, body, .stApp {
  background: linear-gradient(135deg, var(--bg1) 0%, var(--bg2) 50%, var(--bg3));
  color: var(--text);
  font-family: Arial,sans-serif;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  color: var(--text) ;
  letter-spacing: 0.2px;
}

/* Tabs */
.stTabs [data-baseweb="tab"] {
  background: var(--card2);
  color: var(--muted);
  border-radius: 10px 10px 0 0;
  margin-right: 6px;
  font-weight: 600;
}

.stTabs [aria-selected="true"] {
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  color: white;
}

/* Cards */
.card {
  background: var(--card2);
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  border: 1px solid var(--border);
}

/* Metric cards */
.metric-card {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--card);
  border-radius: 12px; padding: 12px 16px; margin-bottom: 10px;
  border: 1px solid rgba(255,255,255,0.06);
}
.metric-title { color: var(--muted); font-size: 13px; }
.metric-value { color: #ffffff; font-size: 20px; font-weight: 700; }

/* Buttons */
.stButton>button {
  background: linear-gradient(135deg, var(--accent1), var(--accent2));
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(255,61,0,0.35);
}
.stButton>button:hover {
  background: linear-gradient(135deg, #ffa733, #ff5a33);
}

/* Inputs */
.stFileUploader, .stTextArea textarea, .stTextInput input, .stSelectbox, .stNumberInput input{
  background: var(--card2) ;
  color: var(--text) ;
  border-radius: 12px ;
  border: 1px solid var(--border) ;
}
label, .stTextArea label, .stFileUploader label, .stMarkdown {
  color: var(--text);
  font-weight: 600;
}
.stTextArea textarea::placeholder, .stTextInput input::placeholder {
  color: var(--muted);
}

/* Expander */
.st-expander {
  background: var(--card2);
  border-radius: 12px;
  border: 1px solid var(--border);
}

/* Chips & badges */
.badge, .chip {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  color: #0f2027;
  background: var(--text);
}

/* Divider */
.divider { 
    height: 1px; 
    background: var(--border); 
    margin: 16px 0; 
}

/* Plotly container fix for dark bg */
.js-plotly-plot .plotly .main-svg {
  background: transparent;
}
</style>
"""
st.markdown(APP_CSS, unsafe_allow_html = True)

# ----- CONSTANTS -----
NEUTRAL_LOW = 0.40
NEUTRAL_HIGH = 0.60
SUMMARY_MIN_LEN = 40
SUMMARY_MAX_LEN = 90
SUMMARY_BEAMS = 4

# ----- PATHS -----
BASE_DIR = "saved_models"
LDA_PATH = os.path.join(BASE_DIR, "ldaModel.gensim")
DICT_PATH = os.path.join(BASE_DIR, "ldaDictionary.gensim")
PHRASERS_PATH = os.path.join(BASE_DIR, "Phrasers.pkl")
SENTIMENT_MODEL_PATH = os.path.join(BASE_DIR, "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "tfidf_vectorizer.pkl")

# ----- LOAD RESOURCES -----
@st.cache_resource
def load_nlp():
    return spacy.load("en_core_web_sm")

@st.cache_resource
def load_artifacts():
    try:
        lda = LdaModel.load(LDA_PATH)
        id2word = Dictionary.load(DICT_PATH)
    except Exception as e:
        raise RuntimeError(f"Failed to load LDA or Dictionary: {e}")
    
    try:
        with open(PHRASERS_PATH, "rb") as f:
            ph = pickle.load(f)
        bigram_mod, trigram_mod = ph.get("bigram_mod"), ph.get("trigram_mod")
        if bigram_mod is None or trigram_mod is None:
            raise ValueError("Phrasers.pkl missing 'bigram_mod' or 'trigram_mod' keys.")
    except Exception as e:
        raise RuntimeError(f"Failed to load phrasers: {e}")

    try:
        with open(SENTIMENT_MODEL_PATH, "rb") as f:
            sentiment_model = pickle.load(f)
        with open(VECTORIZER_PATH, "rb") as f:
            vectorizer = pickle.load(f)
    except Exception as e:
        raise RuntimeError(f"Failed to load sentiment model/vectorizer: {e}")

    return lda, id2word, bigram_mod, trigram_mod, sentiment_model, vectorizer

nlp = load_nlp()
stop_words = stopwords.words("english")
preserve_words = {
    "no","not","never","none","nobody","nothing","neither","nor",
    "very","too","so","such","just","only","really","even",
    "but","yet","though","although","while",
    "hardly","barely","scarcely"
}

# ----- SESSION STATE -----
if 'analyzed' not in st.session_state:
    st.session_state.analyzed = False
if 'results' not in st.session_state:
    st.session_state.results = {}

def clean_text_sentiment(text):
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    doc = nlp(text)
    tokens = []
    for token in doc:
        if token.text in stop_words and token.text not in preserve_words:
            continue
        tokens.append(token.lemma_)
    return " ".join(tokens)

def clean_text(text):
    # Keep only letters, collapse whitespace, lowercase
    text = re.sub(r"<.*?>", " ", str(text))
    text = re.sub(r"[^a-zA-Z]", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text

def tokenize(text, min_len=3):
    return [
        tok for tok in simple_preprocess(text, deacc=True)
        if tok not in stop_words and len(tok) >= min_len
    ]

def build_phrases(tokens_list, bigram_model, trigram_model):
    # Apply bigram then trigram
    bigrammed = [bigram_model[doc] for doc in tokens_list]
    trigrammed = [trigram_model[doc] for doc in bigrammed]
    return trigrammed

def lemmatization(token_docs, allowed_postags=("NOUN","ADJ","VERB","ADV")):
    texts_out = []
    for doc_tokens in token_docs:
        doc = nlp(" ".join(doc_tokens))
        texts_out.append([token.lemma_ for token in doc if token.pos_ in allowed_postags])
    return texts_out

def infer_topics(texts):
    """
    texts: list of raw strings
    returns: list of (bow, topic_dist) per doc
    """
    cleaned = [clean_text(t) for t in texts]
    tokenized = [tokenize(t) for t in cleaned]
    phrased = build_phrases(tokenized, bigram_model, trigram_model)
    lemmatized = lemmatization(phrased)
    bows = [dictionary.doc2bow(doc) for doc in lemmatized]
    topic_dists = [lda_model.get_document_topics(bow, minimum_probability=0.0) for bow in bows]
    return bows, topic_dists, lemmatized

def get_dominant_topic(topic_dist):
    """
    topic_dist: list of (topic_id, prob)
    returns: (topic_id, prob)
    """
    if not topic_dist:
        return None, 0.0
    return max(topic_dist, key = lambda x: x[1])

def topic_keywords(lda, topic_id, topn=10):
    raw_output = lda.show_topic(topic_id, topn=topn)
    return raw_output

# ----- VISUALISATIONS -----
def plot_sentiment_bars(prob_neg, prob_pos):
    df = pd.DataFrame({
        "Sentiment": ["Negative", "Positive"],
        "Probability": [prob_neg, prob_pos]
    })
    fig = px.bar(
        df, x="Sentiment", y="Probability",
        color="Sentiment",
        color_discrete_map={"Negative": "#EF553B", "Positive": "#00CC96"},
        text=df["Probability"].map(lambda v: f"{v:.2%}")
    )
    fig.update_layout(yaxis=dict(range=[0, 1]), showlegend=False, height=300)
    fig.update_traces(textposition="outside")
    return fig

def plot_sentiment_gauge(prob_pos):
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = prob_pos * 100,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Positivity Score"},
        gauge = {
            'axis': {'range': [None, 100]},
            'bar': {'color': "darkblue"},
            'steps': [
                {'range': [0, 45], 'color': "#ffcccb"},  # Red zone
                {'range': [45, 55], 'color': "lightgray"}, # Neutral zone
                {'range': [55, 100], 'color': "lightgreen"}], # Green zone
        }
    ))
    fig.update_layout(height=280, margin=dict(l=20, r=20, t=50, b=20))
    return fig

def plot_topic_keywords_bar(keywords):
    words = []
    probs = []
    
    for i, item in enumerate(keywords):
        if isinstance(item, (tuple, list)) and len(item) >= 2:
            words.append(item[0])
            probs.append(item[1])
        else:
            words.append(str(item))
            probs.append(len(keywords) - i) 
    
    df = pd.DataFrame({'Word': words, 'Importance': probs}).sort_values('Importance', ascending=True)
    
    fig = px.bar(
        df, x='Importance', y='Word', 
        orientation='h',
        color='Importance', color_continuous_scale='Blues'
    )
    return fig

def save_static_plot(fig, filename):
    fig.savefig(filename, format="png", bbox_inches="tight")
    return filename

try:
    lda_model, dictionary, bigram_model, trigram_model, sentiment_model, vectorizer = load_artifacts()
except Exception as e:
    st.error(str(e))
    st.stop()

# UI
st.title("Food Review Analysis Platform")
st.markdown("Analyze reviews with topic modeling, sentiment, and summarization—beautifully and clearly.")

# Input Section
col1, col2 = st.columns([1, 2])
with col1:
    uploaded_file = st.file_uploader("Upload File .txt .csv .docx", type=["txt", "csv", "docx"])
with col2:
    text_input = st.text_area("Or paste text here", height=150, placeholder="Paste a review here...")

if uploaded_file:
    size_kb = uploaded_file.size / 1024 if hasattr(uploaded_file, "size") else None
    size_text = f"{size_kb:.1f} KB" if size_kb else ""
    st.markdown(
        f"<div style='color:#ffffff; font-weight:700; margin-top:6px;'>Uploaded: {uploaded_file.name} {size_text}</div><br><br>",
        unsafe_allow_html=True
    )
    uploaded_file.seek(0)
    try:
        raw_text = read_file(uploaded_file)
    except Exception as e:
        st.error(f"Failed to read file: {e}")
        raw_text = ""
elif text_input and text_input.strip():
    raw_text = text_input.strip()
else:
    raw_text = ""

analyze_btn = st.button("🚀 Analyze Text", type="primary", disabled=not raw_text)

if analyze_btn:
    with st.spinner("Processing..."):
        # Validation
        ok, msg = basic_checks(raw_text)
        if not ok:
            st.warning(msg)
        else:
            try:
                # Topic Modeling
                bows, topic_dists, lemmatized = infer_topics([raw_text])
                dom_tid, dom_prob = get_dominant_topic(topic_dists[0])

                top_keywords_weighted = topic_keywords(lda_model, dom_tid, topn=15)
                top_words_list = []
                for item in top_keywords_weighted:
                    if isinstance(item, (tuple, list)) and len(item) >= 2:
                        top_words_list.append(item[0]) # (word, prob)
                    else:
                        top_words_list.append(str(item))

                # Sentiment
                cleaned_sent = clean_text_sentiment(raw_text)
                vec = vectorizer.transform([cleaned_sent])
                probs = sentiment_model.predict_proba(vec)[0] # [prob_0, prob_1]
                prob_neg, prob_pos = probs[0], probs[1]

                # Summarization
                try:
                    summary = summarize_text(raw_text, min_length=SUMMARY_MIN_LEN, max_length=SUMMARY_MAX_LEN, num_beams=SUMMARY_BEAMS)
                except:
                    summary = "Summarizer unavailable."

                # Insights
                # Build map for reporting
                topic_words_map = {tid: [w for w, p in topic_keywords(lda_model, tid, topn=10)] for tid in range(lda_model.num_topics)}
                insights, recs = generate_insights_and_recommendations(topic_words_map, prob_pos)

                # Store in Session State
                st.session_state.results = {
                    "topic_dist": topic_dists[0],
                    "dom_topic": dom_tid,
                    "dom_prob": dom_prob,
                    "top_keywords_weighted": top_keywords_weighted, # [(word, prob)...]
                    "top_words_list": top_words_list, # [word, word...]
                    "prob_pos": prob_pos,
                    "prob_neg": prob_neg,
                    "summary": summary,
                    "insights": insights,
                    "recs": recs
                }
                st.session_state.analyzed = True
                st.success("Analysis complete!")
            except Exception as e:
                st.error(f"Analysis failed: {e}")


# --- DISPLAY RESULTS ---
if st.session_state.analyzed:
    res = st.session_state.results
    # Logic for Labels
    p_pos = res['prob_pos']
    if NEUTRAL_LOW <= p_pos <= NEUTRAL_HIGH:
        sent_label, sent_color = "Neutral", "off"
    elif p_pos > NEUTRAL_HIGH:
        sent_label, sent_color = "Positive", "normal"
    else:
        sent_label, sent_color = "Negative", "inverse"

    st.divider()

    # DASHBOARD METRICS
    m1, m2, m3, m4 = st.columns(4)

    m1.markdown(
        f"""
        <div style="padding:8px; border-radius:8px;">
        <div style="color:#cfe3f0; font-size:13px; font-weight:600;">Dominant Topic</div>
        <div style="color:#ffffff; font-size:20px; font-weight:800; margin-top:6px;">Topic {res['dom_topic']}</div>
        <div style="color:#9fbcd0; font-size:12px; margin-top:4px;">Confidence: {res['dom_prob']:.0%}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    m2.markdown(
        f"""
        <div style="padding:8px; border-radius:8px;">
        <div style="color:#cfe3f0; font-size:13px; font-weight:600;">Sentiment</div>
        <div style="color:#ffffff; font-size:20px; font-weight:800; margin-top:6px;">{sent_label}</div>
        <div style="color:#9fbcd0; font-size:12px; margin-top:4px;">{p_pos:.2f} Prob</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    m3.markdown(
        f"""
        <div style="padding:8px; border-radius:8px;">
        <div style="color:#cfe3f0; font-size:13px; font-weight:600;">Review Word Count</div>
        <div style="color:#ffffff; font-size:20px; font-weight:800; margin-top:6px;">{len(raw_text.split())} words</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    m4.markdown(
        f"""
        <div style="padding:8px; border-radius:8px;">
        <div style="color:#cfe3f0; font-size:13px; font-weight:600;">Unique topic terms</div>
        <div style="color:#ffffff; font-size:20px; font-weight:800; margin-top:6px;">{len(set(res['top_words_list']))}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # TABS
    tab_sent, tab_topic, tab_sum, tab_rep = st.tabs(["❤️ Sentiment Analysis", "☁️ Topic Analysis", "📝 Summary", "📄 Report"])

    # TAB 1: SENTIMENT
    with tab_sent:
        c1, c2 = st.columns(2)
        with c1:
            st.plotly_chart(plot_sentiment_gauge(res['prob_pos']), use_container_width=True)
        with c2:
            st.plotly_chart(plot_sentiment_bars(res['prob_neg'], res['prob_pos']), use_container_width=True)
            st.caption("Probabilities: Class 0 (Negative) vs Class 1 (Positive)")

    # TAB 2: TOPICS & WORDCLOUD
    with tab_topic:
        st.markdown("#### Topic Analysis for Review")

        st.markdown(f"#### Deep Dive: Dominant Topic ({res['dom_topic']})")
        tc1, tc2 = st.columns(2)
        with tc1:
            st.markdown("**Word Cloud**")
            wc_text = " ".join(res['top_words_list'])
            if wc_text.strip():
                wc = WordCloud(width=700, height=450, background_color="black", colormap="viridis").generate(wc_text)
                fig_wc, ax = plt.subplots(figsize=(7, 4.5))
                ax.imshow(wc, interpolation="bilinear")
                ax.axis("off")
                st.pyplot(fig_wc)
            else:
                st.warning("Not enough words to generate WordCloud")
        with tc2:
            st.markdown("**Keyword Importance**")

            st.markdown("**Key Terms in Dominant Topic**")
            st.plotly_chart(plot_topic_keywords_bar(res['top_keywords_weighted']), use_container_width=True)

    # TAB 3: SUMMARY & INSIGHTS
    with tab_sum:
        st.subheader("Summary")
        st.info(res['summary'])
        sc1, sc2 = st.columns(2)
        with sc1:
            st.markdown("### 💡 Key Insights")
            if res['insights']:
                for item in res['insights']:
                    st.write(f"- {item}")
            else:
                st.write("No specific insights.")
        with sc2:
            st.markdown("### ✅ Recommendations")
            if res['recs']:
                for item in res['recs']:
                    st.write(f"- {item}")
            else:
                st.write("No recommendations.")

    with tab_rep:
        st.write("Generate a standalone report.")

        # Check if report already exists in session state
        report_bytes = st.session_state.get("report_bytes", None)
        report_name = st.session_state.get("report_name", "assets/analysis_report.docx")

        # Build the report if not already built and analysis is done
        if report_bytes is None and st.session_state.get("analyzed", False):
            with st.spinner("Building report..."):
                try:
                    # --- Sentiment chart ---
                    fig_sent, ax_s = plt.subplots(figsize=(6, 3))
                    bars = ax_s.bar(["Negative", "Positive"],
                                [res['prob_neg'], res['prob_pos']],
                                color=["#EF553B", "#00CC96"])
                    ax_s.set_title("Sentiment Probabilities", color="white")
                    ax_s.tick_params(colors="white")
                    for bar, val in zip(bars, [res['prob_neg'], res['prob_pos']]):
                        ax_s.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                                f"{val:.2%}", ha="center", va="bottom",
                                color="black", fontweight="bold")
                    sent_path = "assets/sentiment.png"
                    fig_sent.savefig(sent_path, format="png", bbox_inches="tight",
                                    facecolor=fig_sent.get_facecolor())
                    plt.close(fig_sent)

                    # --- Wordcloud ---
                    fig_wc, ax_wc = plt.subplots(figsize=(7, 4.5))
                    ax_wc.imshow(wc, interpolation="bilinear")
                    ax_wc.axis("off")
                    wc_path = "assets/wordcloud.png"
                    fig_wc.savefig(wc_path, format="png", bbox_inches="tight",
                                facecolor=fig_wc.get_facecolor())
                    plt.close(fig_wc)

                    # --- Build DOCX report ---
                    report_path = build_docx_report(
                        summary=res['summary'],
                        sentiment_img_path=sent_path,
                        wordclouds={"dominant": wc_path},
                        insights=res['insights'],
                        recommendations=res['recs'],
                        dominant_words=res['top_words_list'],
                        output_path="assets/analysis_report.docx"
                    )

                    # Read file into memory for download
                    with open(report_path, "rb") as f:
                        st.session_state["report_bytes"] = f.read()
                    st.session_state["report_name"] = "assets/analysis_report.docx"

                except Exception as e:
                    st.error(f"Report generation failed: {e}")

        if st.session_state.get("report_bytes", None):
            st.download_button(
                label="📥 Download DOCX Report",
                data=st.session_state["report_bytes"],
                file_name=st.session_state.get("report_name", "assets/analysis_report.docx")
            )
        else:
            st.button("📥 Download DOCX Report", disabled=True)