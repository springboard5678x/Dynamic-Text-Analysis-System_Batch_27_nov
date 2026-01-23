import sys
from pathlib import Path
import os
import asyncio
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from typing import Optional

# Setup Paths
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

# Imports
try:
    from services.cleaning import clean_text
    from services.topic_modeling import TopicModeler
    from services.sentiment import SentimentAnalyzer
    from services.summarization import Summarizer
    from services.insights import InsightsGenerator
    from services.analytics import AnalyticsService
    from services.intelligence import IntelligenceService
    from services.file_extractor import extract_text_from_file
    from services.reporting import PDFGenerator

except ImportError:
    # Fallback logic
    from backend.services.cleaning import clean_text
    from backend.services.topic_modeling import TopicModeler
    from backend.services.sentiment import SentimentAnalyzer
    from backend.services.summarization import Summarizer
    from backend.services.insights import InsightsGenerator
    from backend.services.analytics import AnalyticsService
    from backend.services.intelligence import IntelligenceService
    from backend.services.file_extractor import extract_text_from_file
    from backend.services.reporting import PDFGenerator


app = FastAPI(title="NarrativeNexus Backend")

# CORS (Allow Frontend Access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:9002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
print("🚀 Initializing ReCreative AI Services...")
try:
    topic_modeler = TopicModeler()
    sentiment_analyzer = SentimentAnalyzer()
    summarizer = Summarizer()
    insights_generator = InsightsGenerator()
    analytics_service = AnalyticsService()
    intelligence_service = IntelligenceService()
    print("✅ Services Initialized Successfully.")
except Exception as e:
    print(f"❌ Service Initialization Failed: {e}")

pdf_generator = PDFGenerator()


@app.post("/api/analyze")
async def analyze_text(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    num_topics: int = Form(0) # 0 = Auto-Detect Optimal K
):
    #Input Handling
    content = ""
    filename = "input_text"
    
    if file:
        filename = file.filename
        try:
            file_content = await file.read()
            content, file_meta = await run_in_threadpool(extract_text_from_file, file_content, filename)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading file: {e}")
    elif text:
        content = text
        file_meta = {}

    
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="No content provided.")

    #Preprocessing & File Saving
    print(f"Processing: {filename}")
    raw_lines = content.splitlines()
    cleaned_lines = [clean_text(line) for line in raw_lines if line.strip()]
    full_text_cleaned = " ".join(cleaned_lines)
    full_text_raw = " ".join([l for l in raw_lines if l.strip()])
    
    # [Requirement: Saving Preprocessed File]
    processed_dir = os.path.join("datasets", "processed")
    os.makedirs(processed_dir, exist_ok=True)
    processed_path = os.path.join(processed_dir, f"clean_{filename}.txt")
    with open(processed_path, "w", encoding="utf-8") as f:
        f.write("\n".join(cleaned_lines))
    print(f"✅ Preprocessed Data Saved: {processed_path}")

    #Parallel Service Execution
    
    async def run_topic_workflow():
        chunked_docs = chunk_documents(raw_lines)

        dictionary, corpus, tokenized_texts = topic_modeler.prepare_data(chunked_docs)

        if not dictionary:
            return {"error": "Insufficient data for topic modeling"}

        final_k = num_topics
        model_type = "LDA"
        graph_data = []

        if final_k <= 0:
            print("⏳ Running Adaptive Topic Optimization...")
            best_config, graph_data = await run_in_threadpool(
                topic_modeler.find_optimal_model,
                dictionary, corpus, tokenized_texts
            )
            final_k = best_config["k"]
            model_type = best_config["model_type"]

        final_model = await run_in_threadpool(
            topic_modeler.perform_final_model,
            dictionary, corpus, tokenized_texts, final_k, model_type
        )

        final_model["optimization_charts"] = graph_data
        return final_model



    async def run_sentiment():
        """
        Runs 3-Class Prediction -> Trend Analysis -> Distribution
        """
        # Limiting input for speed (top 1000 lines), but using high-accuracy model
        inputs = [l for l in raw_lines if l.strip()][:1000]
        preds = await run_in_threadpool(sentiment_analyzer.predict, inputs)
        trend = await run_in_threadpool(sentiment_analyzer.predict_trend, full_text_raw)
        return {
            "preds": preds, 
            "trend": trend, 
            "distribution": sentiment_analyzer.get_distribution(preds)
        }

    async def run_summary():
        if not full_text_raw: return {"summary": "No text."}
        return await run_in_threadpool(summarizer.summarize, full_text_raw)


    async def run_analytics_task():
        return await run_in_threadpool(analytics_service.analyze, full_text_raw)


    async def run_intelligence_task():
        """
        Runs NER and Highlights extraction.
        """
        # Limiting text for NER to avoid timeout
        ner_res = await run_in_threadpool(intelligence_service.extract_entities, full_text_raw)
        # Using full raw text for highlights to capture original quotes
        highlights = await run_in_threadpool(intelligence_service.extract_key_highlights, full_text_raw, 5)
        return {
            "entities": ner_res,
            "highlights": highlights
        }

    # EXECUTE ALL IN PARALLEL
    print("⚡ Starting Parallel Analysis Engines...")
    topic_res, sent_res, sum_res, ana_res, intel_res = await asyncio.gather(
        run_topic_workflow(), 
        run_sentiment(), 
        run_summary(), 
        run_analytics_task(),
        run_intelligence_task()
    )
    
    #Deep Integration (Sentiment mapped to Topics)
    print("🔄 Integrating Sentiment with Topics...")
    final_topics = topic_res.get("topics", [])
    doc_topics = topic_res.get("doc_topics", [])
    sent_preds = sent_res.get("preds", [])
    
    # Bucket sentiments by Topic ID
    topic_map = {t['id']: {'positive':0, 'neutral':0, 'negative':0, 'total':0} for t in final_topics}
    limit = min(len(doc_topics), len(sent_preds))
    
    for i in range(limit):
        t_id = doc_topics[i]
        if t_id != -1 and t_id in topic_map:
            label = sent_preds[i]['label']
            topic_map[t_id][label] += 1
            topic_map[t_id]['total'] += 1
            
    # Attaching stats and PREVALENCE
    total_docs = len(doc_topics) if doc_topics else 1
    for t in final_topics:
        stats = topic_map.get(t['id'])
        total_sent = stats['total'] if stats['total'] > 0 else 1
        t['sentiment_breakdown'] = {
            "positive": round(stats['positive'] / total_sent, 2),
            "neutral": round(stats['neutral'] / total_sent, 2),
            "negative": round(stats['negative'] / total_sent, 2)
        }
        t['dominant_sentiment'] = max(t['sentiment_breakdown'], key=t['sentiment_breakdown'].get).title()
        t['prevalence'] = round((doc_topics.count(t['id']) / total_docs) * 100, 1)

    #Net Sentiment Score
    sentiment_distribution = sent_res.get("distribution", {})
    net_sentiment_score = sentiment_analyzer.calculate_net_sentiment_score(sentiment_distribution)

    #Generating Strategic Insights
    insights = {}
    risks = []
    urgency_score = 0
    decision_badge = "Low Priority"
    
    if full_text_cleaned:
        print("Generating Strategic Insights...")
        summary_text = sum_res.get("summary", "")
        # Use summary for classification to be fast
        insights = await run_in_threadpool(insights_generator.generate_insights, summary_text)
        
        # Calculate Risks & Urgency on full raw text (or chunk)
        # Using first 5000 chars for speed
        chunk = full_text_raw[:5000]
        risks = await run_in_threadpool(insights_generator.extract_risk_opportunity, chunk)
        urgency_score = await run_in_threadpool(insights_generator.calculate_urgency_score, chunk)
        
        # Determine Decision Badge
        if urgency_score >= 7: decision_badge = "Action Required"
        elif urgency_score >= 4: decision_badge = "Informational"
        else: decision_badge = "Low Priority"

    #Construct Final Frontend Response
    response_payload = {
        "status": "success",
        "meta": {
            "filename": filename,
            "preprocessed_file_path": processed_path,
            "optimal_k_detected": topic_res.get("k", num_topics),
            "optimal_model_used": topic_res.get("model_type", "LDA"),
            "csv_rows": file_meta.get("csv_rows"),
            "csv_cols": file_meta.get("csv_cols")
        },

        "dashboard_data": {
            "topics": final_topics,
            "optimization_charts": topic_res.get("optimization_charts", []),
            "overall_sentiment": sent_res.get("distribution"),
            "sentiment_trend": sent_res.get("trend"),
            "word_cloud": ana_res.get("top_keywords", []),
            "word_cloud_image": ana_res.get("word_cloud_image", ""), 
            "general_stats": ana_res.get("stats", {}),
            "readability": ana_res.get("readability", {}), 
            "entities": intel_res.get("entities", {}),     
            "knowledge_graph": [] 
        },
        "report_data": {
            "ai_summary": sum_res.get("summary"),
            "highlights": intel_res.get("highlights", []),
            "strategic_insights": insights,
            "risks_and_opportunities": risks,              
            "urgency_score": urgency_score,                
            "decision_badge": decision_badge,              
            "recommendations": generate_dynamic_recommendations(final_topics, sent_res, urgency_score),
            "net_sentiment_score": net_sentiment_score     
        }
    }
    
    print("✅ Analysis Complete. Sending Response.")
    return response_payload

from fastapi.responses import StreamingResponse
from pydantic import BaseModel

class ExportRequest(BaseModel):
    data: dict

@app.post("/api/export/pdf")
async def export_pdf(request: ExportRequest):
    pdf_buffer = await run_in_threadpool(pdf_generator.generate_report, request.data)
    
    # Extracting filename from metadata or default
    filename = request.data.get("meta", {}).get("filename", "Analysis_Report")
    # Ensuring it ends with .pdf and has no weird chars (basic cleanup)
    safe_filename = "".join([c for c in filename if c.isalnum() or c in (' ', '.', '-', '_')]).strip()
    if not safe_filename.endswith(".pdf"):
        safe_filename += ".pdf"

    headers = {
        'Content-Disposition': f'attachment; filename="{safe_filename}"'
    }
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)



def chunk_documents(lines, chunk_size=4):
    docs, temp = [], []
    for line in lines:
        if line.strip():
            temp.append(line)
        if len(temp) >= chunk_size:
            docs.append(" ".join(temp))
            temp = []
    if temp:
        docs.append(" ".join(temp))
    return docs

def generate_dynamic_recommendations(topics, sentiment_res, urgency):
    recs = []
    
    #Urgency First
    if urgency >= 8:
        recs.append("Critical: Immediate review of content is required due to high urgency indicators.")
    
    #Check Overall Sentiment
    dist = sentiment_res.get("distribution", {})
    neg_score = dist.get("negative", 0)
    if neg_score > 0.4:
         recs.append("High Negative Sentiment detected. Investigate root causes immediately.")
    elif dist.get("positive", 0) > 0.6:
         recs.append("Strong Positive Sentiment. Identify successful patterns to replicate.")
         
    #Topic Specific
    neg_topics = [t for t in topics if t['dominant_sentiment'] == 'Negative']
    if neg_topics:
        names = ", ".join([t['title'].split('/')[0].strip() for t in neg_topics[:2]])
        recs.append(f"Focus attention on specific issues in: {names}.")
        
    #Default / Fallback
    if len(recs) < 3:
        # Adding a recommendation based on the top topic if available
        if topics:
            top_topic = topics[0]['title']
            recs.append(f"Deep dive into the '{top_topic}' cluster to uncover specific trends.")
        
        recs.append("Monitor key metrics over the next reporting cycle.")
        recs.append("Drill down into specific topics for granular insights.")
        
    return recs