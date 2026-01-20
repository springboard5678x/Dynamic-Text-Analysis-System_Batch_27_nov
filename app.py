import streamlit as st
import backend
import preprocessing
import matplotlib.pyplot as plt

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="NarrativeNexus",
    layout="wide"
)

# ---------------- CUSTOM CSS ----------------
st.markdown("""
<style>
body {
    background: linear-gradient(135deg, #0f172a, #020617);
    color: white;
}

.title {
    font-size: 3rem;
    font-weight: 800;
    background: linear-gradient(to right, #38bdf8, #22c55e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.subtitle {
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 10px;
}

.card {
    background: rgba(255,255,255,0.04);
    border-radius: 18px;
    padding: 22px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}

.metric {
    font-size: 2.2rem;
    font-weight: 700;
}

.label {
    color: #94a3b8;
    font-size: 0.9rem;
}

.section {
    margin-top: 35px;
}
</style>
""", unsafe_allow_html=True)

# ---------------- HEADER ----------------
st.markdown("<div class='title'>NarrativeNexus</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle'>Strategic Text Intelligence Platform</div>", unsafe_allow_html=True)
st.markdown("---")

# ---------------- INPUT AREA ----------------
col1, col2 = st.columns(2)

with col1:
    uploaded_file = st.file_uploader(
        "Upload document",
        type=["pdf", "docx", "csv", "txt"]
    )

with col2:
    manual_text = st.text_area(
        "Paste text for analysis",
        height=160
    )

# ---------------- TEXT LOADING ----------------
text_data = ""

if uploaded_file:
    ext = uploaded_file.name.split(".")[-1].lower()

    if ext == "pdf":
        text_data = backend.read_pdf(uploaded_file)
    elif ext == "docx":
        text_data = backend.read_word(uploaded_file)
    elif ext == "csv":
        text_data = backend.read_csv(uploaded_file)
    else:
        text_data = uploaded_file.read().decode("utf-8")

elif manual_text:
    text_data = manual_text

st.markdown("<br>", unsafe_allow_html=True)

analyze_btn = st.button("Run Analysis", use_container_width=True)

# ---------------- ANALYSIS ----------------
if analyze_btn and text_data.strip():

    proc_text = preprocessing.preprocess_text(text_data)
    summary_text = preprocessing.preprocess_for_summary(text_data)

    polarity, label = backend.analyze_sentiment(proc_text)
    dist = backend.sentiment_distribution(text_data)
    topics = backend.topic_modeling(proc_text)
    summary = backend.summarize_text(summary_text)

    # ---------------- DASHBOARD ----------------
    st.markdown("<div class='section'>", unsafe_allow_html=True)
    st.markdown("## Sentiment Overview")

    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown(f"""
        <div class='card'>
            <div class='metric'>{dist['Positive']}%</div>
            <div class='label'>Positive Sentiment</div>
        </div>
        """, unsafe_allow_html=True)

    with c2:
        st.markdown(f"""
        <div class='card'>
            <div class='metric'>{dist['Neutral']}%</div>
            <div class='label'>Neutral Sentiment</div>
        </div>
        """, unsafe_allow_html=True)

    with c3:
        st.markdown(f"""
        <div class='card'>
            <div class='metric'>{dist['Negative']}%</div>
            <div class='label'>Negative Sentiment</div>
        </div>
        """, unsafe_allow_html=True)

    # ---------------- TABS ----------------
    st.markdown("<div class='section'>", unsafe_allow_html=True)
    tab1, tab2, tab3 = st.tabs(["Summary", "Themes", "Visual Analytics"])

    with tab1:
        st.markdown("<div class='card'>", unsafe_allow_html=True)
        st.write(summary)
        st.markdown("</div>", unsafe_allow_html=True)

    with tab2:
        for title, words in topics:
            st.markdown(f"""
            <div class='card' style='margin-bottom:15px'>
                <strong>{title}</strong><br>
                <span style='color:#94a3b8'>{words}</span>
            </div>
            """, unsafe_allow_html=True)

    with tab3:
        g1, g2, g3 = st.columns(3)

        with g1:
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            st.subheader("Pie Chart")
            fig1, ax1 = plt.subplots()
            ax1.pie(dist.values(), labels=dist.keys(), autopct="%1.1f%%")
            ax1.axis("equal")
            st.pyplot(fig1)
            st.markdown("</div>", unsafe_allow_html=True)

        with g2:
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            st.subheader("Bar Chart")
            fig2, ax2 = plt.subplots()
            ax2.bar(dist.keys(), dist.values())
            ax2.set_ylim(0, 100)
            ax2.set_ylabel("Percentage")
            st.pyplot(fig2)
            st.markdown("</div>", unsafe_allow_html=True)

        with g3:
            st.markdown("<div class='card'>", unsafe_allow_html=True)
            st.subheader("Word Cloud")
            st.pyplot(backend.generate_wordcloud(proc_text))
            st.markdown("</div>", unsafe_allow_html=True)

elif analyze_btn:
    st.error("Please upload a document or paste text before running analysis.")
