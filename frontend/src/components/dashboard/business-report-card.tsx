import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Quote, AlertCircle } from "lucide-react";
import type { ReportData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BusinessReportCardProps {
    data: ReportData;
}

export default function BusinessReportCard({ data }: BusinessReportCardProps) {
    if (!data) return null;

    const badgeColor =
        data.decision_badge === "Action Required" ? "bg-red-500 hover:bg-red-600" :
            data.decision_badge === "Informational" ? "bg-blue-500 hover:bg-blue-600" :
                "bg-gray-500 hover:bg-gray-600";

    return (
        <Card className="bg-card/50 shadow-md h-full border-l-4 border-l-primary/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary" /> Strategic Intelligence
                </CardTitle>
                <Badge className={`${badgeColor} text-white px-3 py-1 text-sm`}>
                    {data.decision_badge}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Urgency */}
                <div className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Urgency Score</span>
                        <span>{data.urgency_score}/10</span>
                    </div>
                    <Progress value={data.urgency_score * 10} className={`h-2 ${data.urgency_score > 7 ? "text-red-500" : "text-blue-500"}`} />
                </div>

                {/* Highlights */}
                {data.highlights && data.highlights.length > 0 && (
                    <div className="space-y-3 p-4 bg-background/50 rounded-lg border">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                            <Quote className="w-4 h-4" /> Key Verification Quotes
                        </h4>
                        <ul className="space-y-2">
                            {data.highlights.map((h, i) => (
                                <li key={i} className="text-xs italic border-l-2 border-primary/20 pl-2 leading-relaxed opacity-80">
                                    "{h}"
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Risks & Opps */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Risks & Opportunities</h4>
                    <div className="space-y-2">
                        {data.risks_and_opportunities?.map((item, idx) => (
                            <div key={idx} className={`p-2 rounded-md border flex items-start gap-2 text-sm ${item.type === 'Risk' ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'
                                }`}>
                                {item.type === 'Risk' ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> : <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />}
                                <span className="leading-snug">
                                    <span className="font-bold">{item.type}:</span> {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
