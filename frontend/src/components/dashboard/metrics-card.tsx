import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, Activity, Fingerprint } from "lucide-react";
import type { ReadabilityMetrics } from "@/types";

interface MetricsCardProps {
    metrics: ReadabilityMetrics;
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
    if (!metrics) return null;

    return (
        <Card className="bg-card/50 shadow-sm transition-all hover:shadow-md h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider text-xs">
                    <BookOpen className="w-4 h-4" /> Content Metrics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-full">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Reading Time</div>
                            <div className="font-bold">{metrics.reading_time_min} min</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-full">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Complexity</div>
                            <div className="font-bold text-sm">{metrics.complexity_label}</div>
                            <div className="text-[10px] text-muted-foreground">Score: {metrics.complexity_score}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 text-green-500 rounded-full">
                            <Fingerprint className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">Lexical Diversity</div>
                            <div className="font-bold">{metrics.lexical_diversity}%</div>
                            <div className="text-[10px] text-muted-foreground">Unique Vocabulary</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
