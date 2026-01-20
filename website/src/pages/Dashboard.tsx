import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Smile, BarChart3, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import ActionCard from "@/components/ActionCard";
import useTextStore from "@/store/textStore";
import { useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { originalText, sentiment, topicModel, datasetSummary } = useTextStore();

  useEffect(() => {
    if (!originalText) {
      navigate("/input");
    }
  }, [originalText, navigate]);

  const wordCount = datasetSummary?.wordCount ?? originalText.split(/\s+/).filter(Boolean).length;
  const charCount = datasetSummary?.charCount ?? originalText.length;

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Analysis Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your content is ready. Choose an analysis method below.
            </p>
            
            {/* Content Stats */}
            <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-full bg-card border border-border">
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{wordCount.toLocaleString()}</strong> words
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{charCount.toLocaleString()}</strong> characters
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">
                Sentiment:{" "}
                <strong className="text-foreground">
                  {sentiment.label ?? "—"}
                </strong>
              </span>
              <span className="w-px h-4 bg-border" />
              <span className="text-sm text-muted-foreground">
                Dominant topic:{" "}
                <strong className="text-foreground">
                  {topicModel.dominantTopic ?? "—"}
                </strong>
              </span>
            </div>
          </motion.div>

          {/* Action Cards */}
          <div className="grid gap-6">
            <ActionCard
              icon={<FileText className="w-6 h-6" />}
              title="Summarize Text"
              description="Generate a concise, rewritten summary of your content that captures the main points and key ideas."
              onClick={() => navigate("/summarization")}
              variant="default"
              delay={0.1}
            />

            <ActionCard
              icon={<Smile className="w-6 h-6" />}
              title="Sentiment Analysis"
              description="Discover the emotional tone and overall sentiment of your text - positive or negative polarity."
              onClick={() => navigate("/sentiment")}
              variant="positive"
              delay={0.2}
            />

            <ActionCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Visualizations"
              description="Explore interactive word clouds, keyword frequencies, and visual patterns in your content."
              onClick={() => navigate("/visualization")}
              variant="accent"
              delay={0.3}
            />
          </div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 text-center"
          >
            <Button variant="outline" onClick={() => navigate("/input")}>
              <ArrowLeft className="w-4 h-4" />
              Upload New Content
            </Button>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
