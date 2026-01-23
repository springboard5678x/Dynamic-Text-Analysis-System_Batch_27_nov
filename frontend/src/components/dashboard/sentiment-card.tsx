'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import type { SentimentDistribution } from "@/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface SentimentCardProps {
  data: SentimentDistribution;
}

export default function SentimentCard({ data }: SentimentCardProps) {
  if (!data) return null;

  const chartData = [
    { name: 'Positive', value: data.positive },
    { name: 'Neutral', value: data.neutral },
    { name: 'Negative', value: data.negative }
  ].filter(d => d.value > 0);

  // Colors for sentiments
  const COLORS: Record<string, string> = {
    'Positive': '#22c55e', // green-500
    'Negative': '#ef4444', // red-500
    'Neutral': '#3b82f6', // blue-500
  };

  return (
    <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Overall Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => {
                  const color = COLORS[entry.name] || '#8884d8';
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <RechartsTooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
