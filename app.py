import streamlit as st
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import re
from collections import Counter
from nltk.corpus import stopwords

from preprocessing import preprocess_text
from basic_analysis import extract_topics_basic, sentiment_basic
from advanced_analysis import extract_topics_lda, sentiment_vader

st.set_page_config(
    page_title="TEXT SUMMARIZER",
    page_icon="#",
    layout="centered"
)


st.markdown("""
<style>
html, body, .stApp {
    background-color: #0f1117;
    color: #eaeaea;
    font-family: 'Segoe UI', sans-serif;
}

/* HERO */
.hero {
    background: linear-gradient(135deg, #111827, #1f2933);
    padding: 60px 35px;
    border-radius: 22px;
    text-align: center;
    box-shadow: 0px 15px 45px rgba(0,0,0,0.5);
    margin-bottom: 40px;
}
.hero h1 {
    font-size: 44px;
    font-weight: 800;
    color: #d4af37;
}
.hero p {
    font-size: 18px;
    color: #cfd3dc;
    max-width: 720px;
    margin: auto;
}

/* CARD */
.card {
    background-color: #1c1f26;
    padding: 30px;
    border-radius: 18px;
    border: 1px solid #2a2f3a;
    box-shadow: 0px 10px 30px rgba(0,0,0,0.4);
    margin-bottom: 30px;
}

/* BUTTON */
.stButton button {
    background: linear-gradient(135deg, #d4af37, #b8962e);
    color: #0f1117;
    font-weight: bold;
    border-radius: 12px;
    padding: 0.6rem 1.6rem;
    border: none;
}
.stButton button:hover {
    background: linear-gradient(135deg, #e5c76b, #caa741);
    transform: scale(1.02);
}

/* INPUTS */
.stTextArea textarea, .stFileUploader {
    background-color: #111827;
    color: #eaeaea;
    border-radius: 10px;
    border: 1px solid #2a2f3a;
}

/* HEADINGS */
h2, h3 {
    color: #d4af37;
}

/* FOOTER */
.footer {
    text-align: center;
    color: #7f8c8d;
    font-size: 14px;
    margin-top: 50px;
}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="hero">
    <h1>TEXT SUMMARIZER</h1>
    <p>
        Professional AI-powered text analytics platform for topic modeling,
        sentiment intelligence, and narrative discovery.
    </p>
</div>
""", unsafe_allow_html=True)

st.markdown('<div class="card">', unsafe_allow_html=True)

st.subheader("📝 Input Text")

text_input = st.text_area(
    "Paste your text here",
    height=170,
    placeholder="Enter articles, reviews, reports, or any narrative text..."
)

uploaded_file = st.file_uploader(
    "Upload .txt file",
    type=["txt"],
    help="Upload large text documents for analysis"
)

st.markdown('</div>', unsafe_allow_html=True)

with st.sidebar:
    st.markdown("## TEXT SUMMARIZER")
    st.markdown("**Professional Text Intelligence Platform**")
    st.markdown("---")
    st.markdown("""
    **Capabilities**
    - Topic Modeling  
    - Sentiment Analysis  
    - Keyword Insights  
    - Visual Analytics  
    """)
    st.markdown("---")
    st.caption("Built with Python & NLP")

st.markdown("<div style='text-align:center;'>", unsafe_allow_html=True)
analyze = st.button("🚀 Analyze Narrative")
st.markdown("</div>", unsafe_allow_html=True)

if analyze:

    if uploaded_file:
        text_input = uploaded_file.read().decode("utf-8")

    if not text_input.strip():
        st.warning("Please provide some text for analysis.")
        st.stop()

    stop_words = set(stopwords.words("english"))
    tokens = re.findall(r'\b\w+\b', text_input.lower())
    tokens = [t for t in tokens if t not in stop_words]

    with st.spinner("Analyzing narrative intelligence..."):

        # -------- BASIC ANALYSIS --------
        st.markdown("---")
        st.subheader("📌 Basic Topic Extraction")

        basic_topics = extract_topics_basic(tokens)
        for topic, words in basic_topics.items():
            st.write(f"**{topic}:** {', '.join(words)}")

        st.subheader(" Basic Sentiment")
        st.success(sentiment_basic(tokens))


        # -------- ADVANCED ANALYSIS --------
        st.markdown("---")
        st.subheader(" Advanced Topic Modeling (LDA)")

        lda_topics = extract_topics_lda(text_input)
        for topic, words in lda_topics.items():
            st.write(f"**{topic}:** {', '.join(words)}")

        st.subheader("🔍 Advanced Sentiment (VADER)")
        st.success(sentiment_vader(text_input))


        # -------- WORD FREQUENCY --------
        st.markdown("---")
        st.subheader("📊 Word Frequency Analysis")

        freq = Counter(tokens)
        common_words = freq.most_common(10)

        if common_words:
            words, counts = zip(*common_words)

            fig, ax = plt.subplots(figsize=(10, 5))
            fig.patch.set_facecolor("#0f1117")
            ax.set_facecolor("#0f1117")

            ax.bar(words, counts, color="#5DADE2")
            ax.set_ylabel("Frequency", color="#eaeaea")
            ax.set_title("Top Words", color="#eaeaea")
            ax.tick_params(axis='x', rotation=30, labelcolor="#cfd3dc")
            ax.tick_params(axis='y', labelcolor="#cfd3dc")

            plt.tight_layout()
            st.pyplot(fig)


        # -------- WORD CLOUD STYLE --------
        st.markdown("---")
        st.subheader("☁️ Keyword Cloud")

        fig, ax = plt.subplots(figsize=(12, 6))
        fig.patch.set_facecolor("#0f1117")
        ax.set_facecolor("#0f1117")

        palette = ["#5DADE2", "#58D68D", "#AF7AC5", "#F7DC6F", "#F1948A", "#48C9B0"]

        cols = 4
        rows = ((len(common_words) - 1) // cols) + 1
        cell_w = 1 / cols
        cell_h = 1 / rows

        for i, (word, count) in enumerate(common_words):
            row = i // cols
            col = i % cols

            x = col * cell_w + cell_w / 2
            y = 1 - (row * cell_h + cell_h / 2)

            fontsize = max(14, min(32, 18 + count * 2))
            color = palette[i % len(palette)]

            ax.add_patch(
                patches.FancyBboxPatch(
                    (x - 0.12, y - 0.07),
                    0.24,
                    0.14,
                    boxstyle="round,pad=0.02",
                    facecolor="#1c1f26",
                    edgecolor="#2a2f3a"
                )
            )

            ax.text(
                x, y, word,
                fontsize=fontsize,
                color=color,
                ha="center",
                va="center",
                fontweight="bold"
            )

        ax.axis("off")
        st.pyplot(fig)

st.markdown("""
<div class="footer">
    AI Narrative Nexus © 2026 • Built with Streamlit, NLP & Python
</div>
""", unsafe_allow_html=True)
