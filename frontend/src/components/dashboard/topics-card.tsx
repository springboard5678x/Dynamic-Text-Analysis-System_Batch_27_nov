'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Network, TrendingUp, BarChart3 } from "lucide-react";
import type { Topic, OptimizationChartPoint } from "@/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend, Cell } from "recharts";

interface TopicCloudCardProps {
  topics: Topic[];
  charts: OptimizationChartPoint[];
}

export default function TopicCloudCard({ topics, charts }: TopicCloudCardProps) {
  if (!topics) return null;

  return (
    <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-500" />
          topic Modeling Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* 1. Optimization Chart (The "Tournament" Result) */}
        {charts && charts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Model Optimization (LDA vs NMF)
            </h4>
            <div className="h-[200px] w-full bg-background/50 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="k" label={{ value: 'K (Topics)', position: 'bottom', offset: 0 }} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="lda_score" stroke="#8884d8" name="LDA Coherence" strokeWidth={2} />
                  <Line type="monotone" dataKey="nmf_score" stroke="#82ca9d" name="NMF Coherence" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">The system automatically selected the best model based on maximum coherence score.</p>
          </div>
        )}

        {/* 2. Topic Prevalence Bar Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Topic Prevalence (% of Content)
          </h4>
          <div className="h-[200px] w-full bg-background/50 rounded-lg p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" unit="%" />
                <YAxis dataKey="title" type="category" width={100} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  formatter={(val: number) => [`${val}%`, "Prevalence"]}
                />
                <Bar dataKey="prevalence" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}>
                  {topics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.dominant_sentiment === 'Positive' ? '#22c55e' :
                        entry.dominant_sentiment === 'Negative' ? '#ef4444' : '#3b82f6'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Detailed Topics List */}
        <div className="grid gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="space-y-2 p-4 border rounded-lg bg-background/40">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-base text-primary">{topic.title}</h4>
                <div className={`text-xs px-2 py-1 rounded-full border ${topic.dominant_sentiment === 'Positive' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                  topic.dominant_sentiment === 'Negative' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}>
                  {topic.dominant_sentiment}
                </div>
              </div>

              <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topic.keywords} layout="vertical" margin={{ left: 40, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="word" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="weight" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
