import { useEffect, useRef } from "react";
import WordCloud from "wordcloud";

const WordCloudView = ({ wordFrequencies }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // 🛑 HARD GUARDS
    if (!canvasRef.current) return;
    if (!wordFrequencies || Object.keys(wordFrequencies).length === 0) return;

    // ✅ DEFINE LIST SAFELY
    const list = Object.entries(wordFrequencies).map(
      ([word, freq]) => [word, freq * 20]
    );

    if (list.length === 0) return;

    // ✅ CLEAR CANVAS (PREVENT CRASH)
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const colors = [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf"
    ];

    WordCloud(canvasRef.current, {
      list,
      gridSize: 8,
      weightFactor: 1.2,
      fontFamily: "Arial",
      fontWeight: "bold",
      color: () => colors[Math.floor(Math.random() * colors.length)],
      rotateRatio: 0.05,
      rotationSteps: 2,
      backgroundColor: "transparent",
      drawOutOfBound: false,
      shrinkToFit: true,
      minSize: 12,
      ellipticity: 0.75
    });
  }, [wordFrequencies]);

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
};

export default WordCloudView;
