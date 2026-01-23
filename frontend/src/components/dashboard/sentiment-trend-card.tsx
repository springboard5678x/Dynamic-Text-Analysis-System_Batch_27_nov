import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity } from "lucide-react";

interface SentimentTrendProps {
    trend: number[];
}

export default function SentimentTrendCard({ trend }: SentimentTrendProps) {
    if (!trend || trend.length === 0) return null;

    const chartData = trend.map((score, index) => ({
        segment: index + 1,
        score: score,
        label: `Part ${index + 1}`
    }));

    return (
        <Card className="h-full bg-card hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Emotional Arc (Timeline)
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="segment" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[-1, 1]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                            formatter={(value: number) => [value.toFixed(2), "Sentiment Score"]}
                        />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
