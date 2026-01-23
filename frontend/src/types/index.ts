export interface Keyword {
  word: string;
  weight: number;
}

export interface TopicSentiment {
  positive: number;
  negative: number;
  neutral: number;
}

export interface Topic {
  id: number;
  title: string;       // New: "Health / Care / Hospital"
  keywords: Keyword[];
  wordcloud_image?: string; // New: Base64 image
  sentiment_breakdown: TopicSentiment;
  dominant_sentiment: string;
  prevalence: number;  // New: % of documents
}

export interface OptimizationChartPoint {
  k: number;
  lda_score: number;
  nmf_score: number;
  winner: "LDA" | "NMF";
}

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface NGram {
  phrase: string;
  count: number;
}

export interface GeneralStats {
  char_count: number;
  word_count: number;
  sentence_count: number;
  avg_word_length: number;
  language?: string;
}

export interface InsightMetric {
  label: string;
  score: number;
}

export interface StrategicInsights {
  intent?: InsightMetric;
  actionability?: InsightMetric;
  urgency?: InsightMetric;
}

// --- New High-Level Containers ---

export interface ReadabilityMetrics {
  reading_time_min: number;
  complexity_score: number;
  complexity_label: string;
  lexical_diversity: number;
}

export interface RiskOpportunity {
  type: "Risk" | "Opportunity";
  text: string;
  level: "High" | "Medium" | "Low";
}

export interface EntityResult {
  ORG?: string[];
  PER?: string[];
  LOC?: string[];
  MISC?: string[];
}

export interface DashboardData {
  topics: Topic[];
  optimization_charts: OptimizationChartPoint[];
  overall_sentiment: SentimentDistribution;
  sentiment_trend: number[];
  word_cloud: NGram[];
  word_cloud_image?: string; // NEW: Base64 image
  general_stats: GeneralStats;
  readability: ReadabilityMetrics; // NEW
  entities: EntityResult;          // NEW
  knowledge_graph: any[];          // Placeholder
}

export interface ReportData {
  ai_summary: string;
  highlights: string[];             // NEW
  strategic_insights: StrategicInsights;
  risks_and_opportunities: RiskOpportunity[]; // NEW
  urgency_score: number;            // NEW
  decision_badge: string;           // NEW
  recommendations: string[];
  net_sentiment_score?: number;
}

export interface AnalysisMeta {
  filename: string;
  preprocessed_file_path: string;
  optimal_k_detected: number;
  optimal_model_used: string;
  csv_rows?: number;
  csv_cols?: number;
}


// The Main API Response Type
export interface AnalysisResult {
  status: string;
  meta: AnalysisMeta;
  dashboard_data: DashboardData;
  report_data: ReportData;
  error?: string;
}
