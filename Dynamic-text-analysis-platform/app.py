

import streamlit as st
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import joblib
import plotly.graph_objects as go

from src.preprocessing import preprocess_text
from src.sentiment_vader import vader_sentiment
from src.sentiment_distilbert import distilbert_sentiment
from src.summarization import summarize_text
from src.summarization_distilbart import distilbart_summarize
from src.insight_generator import generate_user_insight
from src.visualizations import plot_wordcloud
from src.semantic_topic import semantic_topic_scores

# ---------------- CONFIG ----------------
st.set_page_config(
    page_title="AI Text Insight Platform",
    layout="wide"
)

# ---------------- LOAD MODELS ----------------
lda_model = joblib.load("models/lda_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")
topic_name_map = joblib.load("models/topic_names.pkl")

# ---------------- UI HEADER ----------------
st.markdown("# 📊 Intelligent Text Analysis Dashboard")
st.markdown("Topics • Sentiment • Summary • Insights")

# ---------------- TEXT INPUT (MAIN AREA) ----------------
user_text = st.text_area(
    "✍️ Enter Text to Analyze",
    height=260,
    placeholder="Paste news, article, report, blog..."
)

col1, col2 = st.columns([1,2])
with col1:
    use_ai_summary = st.checkbox("Use AI Summary (BART - Slower)")
with col2:
    analyze_btn = st.button("🚀 Analyze Text")




# ---------------- ANALYSIS ----------------
if analyze_btn and user_text.strip():

    with st.spinner("🔍 Analyzing..."):

        # Preprocess
        cleaned = preprocess_text(user_text)

        

        # LDA Topic Modeling
        user_dtm = vectorizer.transform([cleaned])
        topic_probs = lda_model.transform(user_dtm)[0]
        dominant_idx = topic_probs.argmax()
        dominant_lda_topic = topic_name_map[dominant_idx + 1]

        # Semantic Topic Modeling (AI Reasoning)
        semantic_scores = semantic_topic_scores(user_text)
        dominant_semantic_topic = max(semantic_scores, key=semantic_scores.get)

        # Sentiment
        vader = vader_sentiment(user_text)
        bert = distilbert_sentiment(user_text)

        # Summary
        extractive = summarize_text(user_text, 3)
        abstractive = distilbart_summarize(user_text) if use_ai_summary else None

        # Insight
        final_sent = vader["sentiment"].split()[0]
        insight = generate_user_insight(dominant_semantic_topic, final_sent)

    # ---------------- TABS ----------------
    tab1, tab2, tab3, tab4, tab5,tab6= st.tabs(
        ["✨ Overview","📝 Summary", "📌 Topics", "😊 Sentiment", "💡 Insight", "☁️ Word Cloud"]
    )



    def sentiment_gauge(value, title):
        fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=value * 100,
        title={"text": title},
        gauge={
            "axis": {"range": [0, 100]},
            "bar": {"color": "darkblue"},
            "steps": [
                {"range": [0, 40], "color": "#ff4d4d"},
                {"range": [40, 60], "color": "#ffd11a"},
                {"range": [60, 100], "color": "#66cc66"}
            ]
        }
    ))
        return fig

    # -------- SUMMARY --------


    # -------- PRIMARY OVERVIEW TAB (COMPACT) --------
    with tab1:

    # 🔹 Topic (normal size, no huge margin)
       st.markdown(f"**Topic:** {dominant_semantic_topic}")

    # 🔹 Small spacing
       st.markdown("")

    # 🔹 Short AI Summary
       st.markdown("**What this text is about:**")
       if abstractive:
        for line in abstractive[:3]:
            st.markdown(f"- {line}")
       else:
        st.markdown("- AI summary not enabled.")

    # 🔹 Small spacing
       st.markdown("")

    # 🔹 Sentiment (simple)
       if final_sent == "Positive":
        emoji = "😊"
       elif final_sent == "Negative":
        emoji = "😟"
       else:
        emoji = "😐"

       st.markdown(f"**Overall feeling:** {emoji} {final_sent}")

    # 🔹 Small spacing
       st.markdown("")

    # 🔹 Word cloud (small)
       plot_wordcloud(
        cleaned,
        "Quick View",
        "outputs/graphs/mini_wordcloud.png"
    )

       st.image("outputs/graphs/mini_wordcloud.png", width=280)



    with tab2:
        st.subheader("Quick Summary")
        for s in extractive:
            st.write("•", s)

        if use_ai_summary:
            st.markdown("---")
            st.subheader("AI short Summary")
            for s in abstractive:
                st.write("•", s)

    # -------- PRIMARY OVERVIEW TAB --------
    with tab3:
       st.subheader("🧠 What is this text mainly about?")

    # --- MAIN TOPIC ---
       st.markdown(f"### **{dominant_semantic_topic}**")
       st.caption("Detected by understanding the meaning of the text")

       st.divider()

    # --- RELATED THEMES ---
       st.markdown("#### Other related themes")

       sem_df = pd.DataFrame({
        "Topic": list(semantic_scores.keys()),
        "Relevance": list(semantic_scores.values())
    })

    # Normalize to percentage
       sem_df["Relevance (%)"] = (sem_df["Relevance"] / sem_df["Relevance"].sum()) * 100
       sem_df = sem_df.sort_values("Relevance (%)")
       


       fig, ax = plt.subplots(figsize=(3.6, 1.8))  # compact image

       ax.barh(
    sem_df["Topic"],
    sem_df["Relevance (%)"],
    color="#2563eb"
)

# 🔹 LIMIT bar stretch (THIS controls bar length)
       ax.set_xlim(0, 50)   # 👈 not 100 → bars look balanced

# 🔹 Smaller readable text
       ax.tick_params(axis='x', labelsize=6)
       ax.tick_params(axis='y', labelsize=5)

       ax.set_xlabel("Relevance (%)", fontsize=8)

# 🔹 Clean look
       for spine in ax.spines.values():
         spine.set_visible(False)

       plt.tight_layout(pad=0.2)
       st.pyplot(fig)
    # ✅ SMALL & CLEAN GRAPH 
      
#

       st.divider()

    # --- OPTIONAL ADVANCED VIEW ---
       with st.expander("See keyword-based topic view (advanced)"):
        lda_df = pd.DataFrame({
            "Topic": list(topic_name_map.values()),
            "Weight (%)": topic_probs * 100
        }).sort_values("Weight (%)")

        fig2, ax2 = plt.subplots(figsize=(5, 2.5))
        ax2.barh(lda_df["Topic"], lda_df["Weight (%)"])
        ax2.set_xlabel("Weight (%)")
        ax2.set_ylabel("")
        st.pyplot(fig2)




  
    # -------- TOPIC MODEL --------
   
 
    # -------- SENTIMENT --------


    with tab4:
       st.subheader("📊 Sentiment Gauge")

       col1, col2 = st.columns(2)

    # -------- VADER --------
       with col1:
        st.markdown("### 🧪 Rule-Based (VADER)")
        vader_score = (vader["compound"] + 1) / 2
        st.plotly_chart(sentiment_gauge(vader_score, "VADER Sentiment"), use_container_width=True)

    # -------- BERT --------
       with col2:
         st.markdown("### 🤖 AI-Based (BERT)")

         bert_signed = bert["signed_score"]

        # Convert to gauge scale [0,100]
         bert_value = (bert_signed + 1) * 50

         st.plotly_chart(
            sentiment_gauge(bert_value, "BERT Sentiment"),
            use_container_width=True
        )

         st.caption(
            f"Label: {bert['label']} | Confidence: {bert['score']:.2f}"
        )

    # -------- INSIGHT --------
    with tab5:
        st.subheader("Key Insight")
        st.success(insight)
        with st.expander("How generated"):
            st.write(f"""
            Topic: {dominant_semantic_topic}
            Sentiment: {final_sent}
            """)

    # -------- WORD CLOUD --------
    with tab6:
        plot_wordcloud(cleaned, "Themes", "outputs/graphs/wordcloud.png")
        col_left,col_center,col_right=st.columns([1,2,1])
        with col_center: 
           st.image("outputs/graphs/wordcloud.png",width=800)

else:
    st.info("Enter text and click Analyze")





 