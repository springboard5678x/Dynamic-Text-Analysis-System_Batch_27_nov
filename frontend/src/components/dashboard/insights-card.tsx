import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertCircle, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrategicInsights, InsightMetric } from "@/types";
import { Progress } from "@/components/ui/progress";

interface InsightsCardProps {
  insights: StrategicInsights;
}

export default function InsightsCard({ insights }: InsightsCardProps) {
  if (!insights || Object.keys(insights).length === 0) return null;

  const renderMetric = (title: string, data?: InsightMetric, icon?: React.ReactNode) => {
    if (!data) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            {icon} {title}
          </span>
          <span className="font-medium">{data.label}</span>
        </div>
        <Progress value={data.score * 100} className="h-2" />
        <div className="text-xs text-right text-muted-foreground">
          {(data.score * 100).toFixed(1)}% Confidence
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("bg-card border h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">DeBERTa Strategic Insights</CardTitle>
        <Lightbulb className="h-5 w-5 text-yellow-400" />
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {renderMetric("Primary Intent", insights.intent, <Target className="h-4 w-4" />)}
        {renderMetric("Urgency Level", insights.urgency, <AlertCircle className="h-4 w-4" />)}
        {renderMetric("Actionability", insights.actionability, <Zap className="h-4 w-4" />)}
      </CardContent>
    </Card>
  );
}
