# AI Narrative Nexus
# Movie Review Intelligence System

AI Narrative Nexus is a modern AI-powered movie review analysis platform that transforms raw text or documents into actionable insights using Natural Language Processing and Machine Learning.
It provides sentiment analysis, topic modeling, summarization, and visual analytics through a sleek, production-grade user interface.

# ✨ Features

* 🧠 AI Sentiment Analysis : Accurately classifies reviews as Positive, Negative, or Neutral with confidence scores.

* 📄 Text & File Analysis : Supports both direct text input and PDF/DOC/DOCX uploads.

* 📝 Automatic Review Summarization : Generates concise summaries from long reviews.

* 🧩 Topic Modeling & Breakdown : Identifies key themes and dominant topics within reviews.

* ☁️ Word Cloud Visualization : Highlights frequently occurring terms in an intuitive visual format.

* 📊 Word Frequency Bar Chart: Quantitative breakdown of important words.

* 🎨 Modern Glassmorphism UI : Premium design with smooth animations and responsive layout.

# 🛠️ Tech Stack
## Frontend

* React.js

* CSS (Glassmorphism + Animations)

* Fetch API

## Backend

* FastAPI

* Python

* Uvicorn

* python-multipart (for file uploads)

## AI / NLP

* Transformer-based sentiment models

* Topic modeling

* Text preprocessing & analysis
<pre>
project-root/
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── WordCloudView.jsx
│   │       └── WordFrequencyBar.jsx
│   │
│   ├── package.json
│   └── README.md
│
└── README.md
</pre>

# 🚀 Getting Started
## 1️⃣ Clone the Repository
git clone : https://github.com/chetna3110/ai-narrative-nexus.git

cd ai-narrative-nexus

## 2️⃣ Backend Setup
cd backend

pip install -r requirements.txt

uvicorn app:app --reload


Backend will run at: http://127.0.0.1:8000

Swagger Docs: http://127.0.0.1:8000/docs

## 3️⃣ Frontend Setup
cd frontend

npm install

npm run dev


Frontend will run at: http://localhost:5173

## ✨ AI Review Analysis Dashboard 
<p>
<img width="1893" height="957" alt="Screenshot 2026-01-21 175704" src="https://github.com/user-attachments/assets/a3e64333-e527-4086-94d5-b30849c7eca8"width="400" />
<img width="1903" height="915" alt="Screenshot 2026-01-21 175715" src="https://github.com/user-attachments/assets/e4ce1664-0e1c-4690-96fa-dc994a61f712"width="400" />
</p>

<p>
<img width="789" height="660" alt="Screenshot 2026-01-21 175734" src="https://github.com/user-attachments/assets/502a81a9-7d86-4a70-a083-3c98d6f762a4" width="400"/>
<img width="843" height="632" alt="Screenshot 2026-01-21 175725" src="https://github.com/user-attachments/assets/eb849bd7-88b6-45f0-8d93-c6570651aa0a" width="400" />
</p>
