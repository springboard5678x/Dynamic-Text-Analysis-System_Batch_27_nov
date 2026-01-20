import type { SentimentLabel, TopicDistributionItem, TopicVsSentimentPoint } from "@/store/textStore";

/**
 * This file intentionally keeps NLP logic *simple and explicit*.
 *
 * Demo strategy (student-friendly):
 * - We keep pre-trained models in `/models` (pkl files).
 * - For the frontend demo, we read a small JSON file from `public/models/demo_outputs.json`.
 *   That JSON is considered "precomputed output / configuration" created offline using those models.
 *
 * Why this approach:
 * - No backend needed
 * - Works offline
 * - UI still works even if JSON is missing (we fall back to a tiny heuristic)
 */

type DemoOutputs = {
  topics?: Array<{ id: number; name: string; keyTerms: string[] }>;
  sentimentLexicon?: { positive: string[]; negative: string[] };
};

let cachedDemoOutputs: DemoOutputs | null = null;

async function loadDemoOutputs(): Promise<DemoOutputs | null> {
  if (cachedDemoOutputs) return cachedDemoOutputs;

  try {
    const response = await fetch("/models/demo_outputs.json");
    if (!response.ok) return null;
    const json = (await response.json()) as DemoOutputs;
    cachedDemoOutputs = json;
    return json;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeDistribution(items: Array<{ topic: string; score: number }>): TopicDistributionItem[] {
  const total = items.reduce((sum, i) => sum + i.score, 0);
  if (total <= 0) return items.map((i) => ({ topic: i.topic, score: 0 }));
  return items.map((i) => ({ topic: i.topic, score: i.score / total }));
}

function getSentenceCount(text: string) {
  const sentences = text
    .split(/[.!?]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length;
}

function heuristicSentiment(text: string): { label: SentimentLabel; score: number } {
  // Expanded lexicon-based polarity (similar spirit to VADER, but comprehensive for demo).
  const positiveWords = [
    "good", "great", "excellent", "amazing", "wonderful", "happy", "love", "best", "success",
    "benefit", "improve", "positive", "growth", "opportunity", "advantage", "progress", "achievement",
    "prosperous", "thriving", "optimistic", "hopeful", "confident", "satisfied", "pleased", "delighted"
  ];
  const negativeWords = [
    "bad", "terrible", "awful", "hate", "worst", "fail", "poor", "sad", "wrong", "problem",
    "concern", "concerns", "serious", "difficult", "uncertain", "uncertainty", "pessimistic", "decline",
    "struggling", "pressure", "risk", "issue", "crisis", "challenge", "worry", "anxious", "fear",
    "criticized", "criticism", "hesitant", "hesitation", "reduced", "reduction", "cut", "cuts",
    "loss", "losses", "declining", "decreasing", "negative", "unfavorable", "disappointed", "frustrated"
  ];

  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;

  for (const w of positiveWords) pos += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;
  for (const w of negativeWords) neg += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;

  const total = pos + neg || 1;
  const raw = (pos - neg) / total; // -1..1 (roughly)
  const score = clamp(raw, -1, 1);

  // Lower threshold so negative text actually shows as negative
  const label: SentimentLabel = score > 0.1 ? "Positive" : score < -0.05 ? "Negative" : "Neutral";
  return { label, score: Number(score.toFixed(3)) };
}

function lexiconSentiment(text: string, lexicon: { positive: string[]; negative: string[] }) {
  // Same idea as heuristicSentiment, but words come from demo JSON (generated offline).
  // Also merge with expanded heuristic words for better coverage.
  const expandedPositive = [
    ...lexicon.positive,
    "good", "great", "excellent", "amazing", "wonderful", "happy", "love", "best", "success",
    "benefit", "improve", "positive", "growth", "opportunity", "advantage", "progress", "achievement"
  ];
  const expandedNegative = [
    ...lexicon.negative,
    "bad", "terrible", "awful", "hate", "worst", "fail", "poor", "sad", "wrong", "problem",
    "concern", "concerns", "serious", "difficult", "uncertain", "uncertainty", "pessimistic", "decline",
    "struggling", "pressure", "risk", "issue", "crisis", "challenge", "worry", "anxious", "fear",
    "criticized", "criticism", "hesitant", "hesitation", "reduced", "reduction", "cut", "cuts"
  ];

  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;

  for (const w of expandedPositive) pos += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;
  for (const w of expandedNegative) neg += (lower.match(new RegExp(`\\b${w}\\b`, "g")) || []).length;

  const total = pos + neg || 1;
  const raw = (pos - neg) / total;
  const score = clamp(raw, -1, 1);
  // Lower threshold so negative text actually shows as negative
  const label: SentimentLabel = score > 0.1 ? "Positive" : score < -0.05 ? "Negative" : "Neutral";
  return { label, score: Number(score.toFixed(3)) };
}

function fallbackTopics() {
  // Simple keyword-based topic sets (works even without the JSON).
  // Academic framing (for demo): "dictionary-based topic proxy using curated keyword clusters".
  // Topic names match the Python script's get_topic_name() mapping.
  return [
    { name: "Sports", keyTerms: ["sport", "game", "team", "player", "match", "championship", "athlete", "competition"] },
    { name: "Politics & Government", keyTerms: ["government", "policy", "political", "election", "vote", "law", "democracy", "citizen"] },
    { name: "Technology & Digital Media", keyTerms: ["technology", "digital", "computer", "software", "internet", "data", "system", "platform"] },
    { name: "Movies & Entertainment", keyTerms: ["movie", "film", "entertainment", "actor", "cinema", "show", "series", "media"] },
    { name: "Economy & Business", keyTerms: ["economy", "business", "market", "financial", "economic", "trade", "industry", "company"] },
  ];
}

function scoreTopicsFromKeywords(
  keywords: Array<{ word: string; count: number }>,
  topics: Array<{ name: string; keyTerms: string[] }>,
) {
  // Topic score = sum of counts of matching keyTerms in the keyword list.
  // This approximates "topic activation" using keyword overlap (works even without full NMF inference).
  // If topics have placeholder terms (like "term_0_1"), replace them with actual frequent keywords.
  const keywordMap = new Map<string, number>();
  for (const k of keywords) keywordMap.set(k.word.toLowerCase(), k.count);

  // Check if we have placeholder terms that need replacement
  const hasPlaceholders = topics.some((t) => t.keyTerms[0]?.startsWith("term_"));
  
  // If placeholders exist, replace topic keyTerms with actual frequent keywords
  const processedTopics = topics.map((t) => {
    if (hasPlaceholders && t.keyTerms[0]?.startsWith("term_")) {
      // Replace placeholder terms with top keywords from input text
      const topKeywords = keywords
        .slice(0, Math.max(t.keyTerms.length, 8))
        .map((k) => k.word.toLowerCase());
      return { ...t, keyTerms: topKeywords };
    }
    return t;
  });

  // Score topics using actual keywords
  const rawScores = processedTopics.map((t) => {
    const score = t.keyTerms.reduce((sum, term) => sum + (keywordMap.get(term.toLowerCase()) || 0), 0);
    return { topic: t.name, score };
  });

  const distribution = normalizeDistribution(rawScores);
  const dominant = distribution.slice().sort((a, b) => b.score - a.score)[0];
  const dominantTopic = dominant?.topic ?? processedTopics[0]?.name ?? null;
  const dominantTopicKeyTerms = processedTopics.find((t) => t.name === dominantTopic)?.keyTerms ?? [];

  return { distribution, dominantTopic, dominantTopicKeyTerms };
}

function buildTopicVsSentiment(distribution: TopicDistributionItem[], sentiment: SentimentLabel): TopicVsSentimentPoint[] {
  // Demo-friendly visualization:
  // value = topicScore * sentimentWeight
  const sentimentWeight = sentiment === "Positive" ? 1 : sentiment === "Neutral" ? 0.6 : 0.9;
  return distribution.map((d) => ({
    topic: d.topic,
    sentiment,
    value: Number((d.score * 100 * sentimentWeight).toFixed(2)),
  }));
}

export async function analyzeForDemo(params: {
  text: string;
  keywords: Array<{ word: string; count: number }>;
}) {
  const { text, keywords } = params;

  const demo = await loadDemoOutputs();
  const topics = demo?.topics?.length
    ? demo.topics.map((t) => ({ name: t.name, keyTerms: t.keyTerms }))
    : fallbackTopics();

  const sentimentResult = demo?.sentimentLexicon
    ? lexiconSentiment(text, demo.sentimentLexicon)
    : heuristicSentiment(text);

  const topicResult = scoreTopicsFromKeywords(keywords, topics);

  const datasetSummary = {
    wordCount: text.split(/\s+/).filter(Boolean).length,
    charCount: text.length,
    sentenceCount: getSentenceCount(text),
  };

  return {
    datasetSummary,
    sentiment: sentimentResult,
    topicModel: {
      dominantTopic: topicResult.dominantTopic,
      dominantTopicKeyTerms: topicResult.dominantTopicKeyTerms,
      distribution: topicResult.distribution,
      topicVsSentiment: buildTopicVsSentiment(topicResult.distribution, sentimentResult.label),
    },
  };
}

