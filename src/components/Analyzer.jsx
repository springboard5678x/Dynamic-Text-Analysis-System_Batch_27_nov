import { useState } from "react";

function Analyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeReview = async () => {
    if (!text.trim()) {
      setError("Please enter a review");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analyzer">
      <textarea
        placeholder="Paste movie review here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={analyzeReview}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h3>Sentiment: {result.sentiment}</h3>
          <p>Score: {result.sentiment_score}</p>
          <p>Decision: {result.decision}</p>

          <h4>Primary Topic: {result.primary_topic}</h4>

          <ul>
            {Object.entries(result.topic_breakdown).map(([topic, score]) => (
              <li key={topic}>
                {topic}: {score}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Analyzer;
