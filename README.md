# INSIGHTIQ. - Dynamic Text Analysis System

## Overview
This project performs dynamic text analysis using Natural Language Processing (NLP).
It supports sentiment analysis, topic modeling, and text summarization through a
Streamlit-based interactive dashboard.

## Features
- Sentiment analysis using a trained ML classifier
- Topic modeling using TF-IDF and NMF
- Abstractive text summarization
- Interactive Streamlit UI
- PDF report generation

## Tech Stack
- Python
- Streamlit
- Scikit-learn
- NLTK
- Joblib

## Project Structure
- app.py – Main Streamlit application
- sentimentanalysis.py – Sentiment prediction logic
- summarization.py – Text summarization module
- main_topic_model.py – Topic modeling pipeline
- models/ – Pre-trained ML models (.joblib / .pkl)
- screenshots/-(dashboard.png,sentimentoutput.png,topic_modelling.png,summary.png)



## Project Structure
```
Dynamic-Text-Analysis-System/
│
├── app.py                     # Main Streamlit application
├── main.py                    # Application entry logic
├── sentimentanalysis.py       # Sentiment prediction module
├── summarization.py           # Text summarization logic
├── main_topic_model.py        # Topic modeling pipeline
├── preprocessing.py           # Text preprocessing utilities
├── tuningnmf.py               # NMF tuning and experimentation
│
├── models/                    # Pre-trained ML models (ignored if large)
│   ├── tfidf_vectorizer.joblib
│   ├── nmf_model.joblib
│   └── sentiment_model.pkl
│
├── screenshots/               # Application screenshots
│   ├── dashboard.png
│   ├── sentiment analysis and keywords.png
│   ├── topic_modeling.png
│   ├── summary.png
│   └── summarization_insight.png
│
├── LICENSE                    # MIT License
├── README.md                  # Project documentation
```
## How It Works
1.Text Input
The user uploads a PDF file or enters raw text through the Streamlit interface.

2.Preprocessing
The text is cleaned by removing punctuation, stopwords, and unnecessary symbols.
Tokenization and normalization are applied to prepare the text for analysis.

3.Sentiment Analysis
A trained machine learning classifier predicts the sentiment of the text
(Positive, Negative, or Neutral) along with confidence scores.

4.Topic Modeling
TF-IDF vectorization is applied to the text, followed by Non-negative Matrix Factorization (NMF)
to extract dominant topics and their associated keywords.

5.Text Summarization
Abstractive text summarization is performed to generate a concise summary of the input content.

6.Visualization and Report Generation
Results are displayed interactively on the dashboard and can be downloaded as a PDF report.

## Features
PDF and text-based input support
Sentiment analysis with confidence scores
Keyword extraction and word cloud visualization
Topic modeling using TF-IDF and NMF
Abstractive text summarization
Interactive Streamlit dashboard
Downloadable PDF analysis report

## Dataset Used-IMDB MOVIE REVIEWS DATASET

## Screenshots

### Dashboard Interface
![Dashboard Interface](screenshots/dashboard.png)

### Sentiment Analysis and Keywords
![Sentiment Analysis and Keywords](screenshots/sentiment%20analysis%20and%20keywords.png)

### Topic Modeling Results
![Topic Modeling Results](screenshots/topic_modeling.png)

### Text Summarization Output
![Text Summarization Output](screenshots/summary.png)

### Summarization Insight
![Summarization Insight](screenshots/summarization%20insight.png)

## How to Run
```bash
pip install -r requirements.txt
python -m streamlit run app.py
