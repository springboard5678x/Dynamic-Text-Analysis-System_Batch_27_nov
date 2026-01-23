
import { useState } from 'react';
import type { AnalysisResult, Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileText, Languages, Type, AlignLeft, Download,
    BarChart3, PieChart, TrendingUp, Network, Zap,
    AlertTriangle, Lightbulb, ArrowRight, Copy, FileJson,
    Database
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';

import SummaryCard from './summary-card';
import AnalyticsCard from './analytics-card';
import BusinessReportCard from './business-report-card';
import RecommendationsCard from './recommendations-card';
import EntitiesCard from './entities-card';

interface DashboardProps {
    data: AnalysisResult;
    onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
    if (!data) return null;

    const { dashboard_data, report_data, meta } = data;
    const { general_stats } = dashboard_data;

    // --- Helpers for Sentiment Color ---
    const getSentimentColor = (score: number) => {
        if (score > 0.3) return "text-green-500";
        if (score < -0.3) return "text-red-500";
        return "text-yellow-500";
    };

    const netSentiment = report_data.net_sentiment_score || 0;

    // --- Gauge Chart Data (Half Donut) ---
    const gaugeData = [
        { name: 'Score', value: (netSentiment + 1) * 50 }, // Map -1..1 to 0..100
        { name: 'Remaining', value: 100 - ((netSentiment + 1) * 50) }
    ];

    const handleExportPDF = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/export/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: { dashboard_data, report_data, meta } }),
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Analysis_Report_${meta.filename.split('.')[0]}.pdf`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to generate PDF report.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans text-slate-800 dark:text-slate-100">

            {/* --------------------------------------------------
          HEADER
          File Name | File Type | Language | Word Count
      -------------------------------------------------- */}
            <header className="bg-card border-b p-6 rounded-lg shadow-sm flex flex-wrap justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{meta.filename}</h1>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Type className="w-3 h-3" /> {meta.filename.split('.').pop()?.toUpperCase() || 'TXT'}</span>
                            <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {general_stats.language?.toUpperCase() || 'EN'}</span>
                            <span className="flex items-center gap-1"><Languages className="w-3 h-3" /> {general_stats.language?.toUpperCase() || 'EN'}</span>
                            <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" /> {general_stats.word_count.toLocaleString()} Words</span>
                            {meta.csv_rows && (
                                <span className="flex items-center gap-1 border-l pl-2 ml-2"><Database className="w-3 h-3" /> {meta.csv_rows} Rows x {meta.csv_cols} Cols</span>
                            )}

                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <Download className="w-4 h-4 mr-2" /> Export Report (PDF)
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <ArrowRight className="w-4 h-4 mr-2" /> New Analysis
                    </Button>
                </div>
            </header>

            {/* --------------------------------------------------
          SECTION 1: EXECUTIVE SUMMARY
      -------------------------------------------------- */}
            {/* --------------------------------------------------
          SECTION 1: EXECUTIVE SUMMARY
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 shadow-md">

                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" /> Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
                            {report_data.ai_summary || "No summary available."}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* --------------------------------------------------
          SECTION 2: DOCUMENT STATISTICS (Cards / KPIs)
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <h3 className="section-header mb-4 text-xs font-bold text-muted-foreground tracking-widest uppercase">
                    Section 2: Document Overview Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <KpiCard label="Total Words" value={general_stats.word_count.toLocaleString()} icon={<AlignLeft />} />
                    <KpiCard label="Total Sentences" value={general_stats.sentence_count.toLocaleString()} icon={<FileText />} />
                    <KpiCard label="Language" value={general_stats.language?.toUpperCase() || "N/A"} icon={<Languages />} />
                    <KpiCard label="Topics Identified" value={dashboard_data.topics.length} icon={<Network />} />
                    <KpiCard
                        label="Net Sentiment"
                        value={netSentiment > 0 ? `+${netSentiment}` : `${netSentiment}`}
                        icon={<TrendingUp />}
                        className={getSentimentColor(netSentiment)}
                    />
                </div>
            </section>

            {/* --------------------------------------------------
          SECTION 3: TOPIC MODELING RESULTS
      -------------------------------------------------- */}
            {/* --------------------------------------------------
          SECTION 3: TOPIC MODELING RESULTS
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3.1 Topic Distribution Chart */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Topic Distribution by Relevance</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboard_data.topics} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                    <XAxis type="number" unit="%" hide />
                                    <YAxis dataKey="title" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem' }} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="prevalence" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30}>
                                        {dashboard_data.topics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.dominant_sentiment === 'Positive' ? '#22c55e' :
                                                    entry.dominant_sentiment === 'Negative' ? '#ef4444' : '#3b82f6'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 3.2 Topic Breakdown Table (Simplified) */}
                    <Card className="lg:col-span-1 shadow-sm overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-base">Identified Topics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="p-2 text-left font-medium">Topic</th>
                                            <th className="p-2 text-right font-medium">%</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard_data.topics.map(t => (
                                            <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="p-2">
                                                    <div className="font-semibold truncate max-w-[180px]" title={t.title}>{t.title}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                                        {t.keywords.map(k => k.word).slice(0, 3).join(", ")}
                                                    </div>
                                                </td>
                                                <td className="p-2 text-right font-mono text-muted-foreground">
                                                    {t.prevalence}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3.3 New: Topic Keyword Clouds */}
                    <Card className="lg:col-span-3 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" /> Topic Vocabulary Clusters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dashboard_data.topics.map(t => (
                                    <div key={t.id} className="p-4 rounded-lg bg-card border shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-sm line-clamp-1 text-primary" title={t.title}>{t.title}</h4>
                                            <Badge variant="secondary" className="text-xs">{t.prevalence}%</Badge>
                                        </div>

                                        {/* Word Cloud Image or Fallback */}
                                        {t.wordcloud_image ? (
                                            <div className="rounded-md overflow-hidden border bg-white p-2">
                                                <img
                                                    src={`data:image/png;base64,${t.wordcloud_image}`}
                                                    alt={`Word cloud for ${t.title}`}
                                                    className="w-full h-auto object-contain hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {t.keywords.slice(0, 10).map((k: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground border">
                                                        {k.word}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>


            {/* --------------------------------------------------
          SECTION 4: SENTIMENT ANALYSIS
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 4.1 Overall Sentiment Distribution */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Overall Sentiment</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={[
                                            { name: 'Positive', value: dashboard_data.overall_sentiment.positive },
                                            { name: 'Neutral', value: dashboard_data.overall_sentiment.neutral },
                                            { name: 'Negative', value: dashboard_data.overall_sentiment.negative },
                                        ].filter(x => x.value > 0)}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </RePieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 4.2 Sentiment by Topic (Stacked Bar) */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Sentiment by Topic</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboard_data.topics} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="id" tick={false} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem' }} />
                                    <Bar dataKey="sentiment_breakdown.positive" name="Pos" stackId="a" fill="#22c55e" />
                                    <Bar dataKey="sentiment_breakdown.neutral" name="Neu" stackId="a" fill="#3b82f6" />
                                    <Bar dataKey="sentiment_breakdown.negative" name="Neg" stackId="a" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* 4.3 Net Sentiment Score (Gauge) */}
                    <Card className="shadow-sm flex flex-col justify-center items-center">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-base text-center">Net Sentiment Score</CardTitle>
                            <CardDescription className="text-center text-xs">Range: -1.0 to +1.0</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={gaugeData}
                                        cx="50%" cy="70%"
                                        startAngle={180} endAngle={0}
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill={getSentimentColor(netSentiment).includes('red') ? '#ef4444' : getSentimentColor(netSentiment).includes('green') ? '#22c55e' : '#eab308'} />
                                        <Cell fill="#e2e8f0" />
                                    </Pie>
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className={`absolute bottom-10 text-4xl font-bold ${getSentimentColor(netSentiment)}`}>
                                {netSentiment > 0 ? `+${netSentiment}` : netSentiment}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* --------------------------------------------------
          SECTION 5: KEY TERMS & WORD CLOUD
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnalyticsCard
                        stats={general_stats}
                        wordCloud={dashboard_data.word_cloud}
                        wordCloudImage={dashboard_data.word_cloud_image}
                        mode="cloud"
                    />
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Top Keywords</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboard_data.word_cloud.slice(0, 15)} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="phrase" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '0.5rem' }} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* --------------------------------------------------
          SECTION 6: INSIGHTS & SUMMARIES
      -------------------------------------------------- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <BusinessReportCard data={report_data} />
                    </div>

                    <div className="lg:col-span-1">
                        <RecommendationsCard recommendations={report_data.recommendations} />
                    </div>
                </div>
            </section>



        </div>
    );
}

function KpiCard({ label, value, icon, className = "" }: { label: string, value: string | number, icon: React.ReactNode, className?: string }) {
    return (
        <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="text-muted-foreground mb-2 flex justify-between items-start">
                    <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                    <span className="text-muted-foreground/50">{icon}</span>
                </div>
                <div className={`text-2xl font-bold ${className}`}>
                    {value}
                </div>
            </CardContent>
        </Card>
    )
}

