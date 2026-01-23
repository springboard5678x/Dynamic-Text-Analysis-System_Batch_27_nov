import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Briefcase } from "lucide-react";

interface RecommendationsCardProps {
    recommendations: string[];
}

export default function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
    if (!recommendations || recommendations.length === 0) return null;

    return (
        <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    Key Actions (Business)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border hover:border-primary/50 transition-colors">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm leading-relaxed">{rec}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
