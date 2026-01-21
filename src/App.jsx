import { useState } from "react";
import WordCloudView from "./components/WordCloudView";
import WordFrequencyBar from "./components/WordFrequencyBar";

function App() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeReview = async () => {
    if (!text.trim() && !file) {
      setError("Please enter text or upload a file");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null); // ✅ FIX: reset result, DO NOT use data here

    try {
      let res;

      // ✅ FILE MODE
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        res = await fetch("http://127.0.0.1:8000/analyze-file", {
          method: "POST",
          body: formData,
        });
      }
      // ✅ TEXT MODE
      else {
        res = await fetch("http://127.0.0.1:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      if (!res.ok) throw new Error("Backend error");

      const data = await res.json(); // ✅ data defined here
      console.log("BACKEND RESPONSE:", data);

      setResult(data); // ✅ SAFE
    } catch (err) {
      console.error(err);
      setError("Failed to analyze input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* HERO */}
      <section className="hero">
        <h1 className="title">AI Narrative Nexus</h1>
        <p className="subtitle">Movie Review Intelligence System</p>
      </section>

      {/* INPUT */}
      <div className="input-grid">
        <div className="card">
          <h3>Text Review</h3>
          <textarea
            className="review-box"
            placeholder="Paste review here..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFile(null);
            }}
          />
        </div>

        <div className="card">
          <h3>Upload PDF / DOC</h3>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setText("");
            }}
          />
        </div>
      </div>

      <button className="analyze-btn" onClick={analyzeReview} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Review"}
      </button>

      {loading && <p>Analyzing...</p>}
      {error && <p className="error">{error}</p>}

      {/* RESULTS */}
      {result && !loading && (
        <section className="results">
          {/* SUMMARY */}
          {result.summary && (
            <div className="card">
              <h3>Review Summary</h3>
              <p>{result.summary}</p>
            </div>
          )}

          {/* STATUS */}
          <div className="status-strip">
              <div className="status-card yellow">
                <span className="status-label">Sentiment Score : </span>
                <strong className="status-value">
                  {result.sentiment_score ?? "N/A"}
                </strong>
              </div>
            
              <div className="status-card green">
                <span className="status-label">Sentiment : </span>
                <strong className="status-value">
                  {result.sentiment ?? "N/A"}
                </strong>
              </div>
            
              <div className="status-card red">
                <span className="status-label">Decision : </span>
                <strong className="status-value">
                  {result.decision ?? "N/A"}
                </strong>
              </div>
            </div>


          {/* PRIMARY TOPIC */}
          {result.primary_topic && (
            <div className="card">
              <h3>Primary Topic</h3>
              <p>{result.primary_topic}</p>
            </div>
          )}

          {/* TOPIC BREAKDOWN */}
          {result.topic_breakdown &&
            Object.keys(result.topic_breakdown).length > 0 && (
              <div className="card">
                <h3>Topic Breakdown</h3>
                {Object.entries(result.topic_breakdown).map(
                  ([topic, value]) => (
                    <div key={topic} className="topic-row">
                      <span>{topic}</span>
                      <span>{value}%</span>
                    </div>
                  )
                )}
              </div>
            )}

          {/* WORD VISUALS */}
          {result.word_frequencies &&
            Object.keys(result.word_frequencies).length > 0 && (
              <div className="word-viz-row">
                <WordCloudView wordFrequencies={result.word_frequencies} />
                <WordFrequencyBar wordFrequencies={result.word_frequencies} />
              </div>
            )}
        </section>
      )}
    </div>
  );
}

export default App;
