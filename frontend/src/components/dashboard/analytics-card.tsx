import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneralStats, NGram } from "@/types";
import { Hash, Cloud } from "lucide-react";

interface AnalyticsCardProps {
    stats: GeneralStats;
    wordCloud: NGram[];
    wordCloudImage?: string;
    mode?: 'stats' | 'cloud' | 'both';
}

export default function AnalyticsCard({ stats, wordCloud, wordCloudImage, mode = 'both' }: AnalyticsCardProps) {
    if (!stats) return null;

    // Normalize counts for font sizing
    const maxCount = Math.max(...(wordCloud?.map(w => w.count) || [1]));

    const getFontSize = (count: number) => {
        const minSize = 0.8;
        const maxSize = 2;
        const normalized = count / maxCount;
        return `${minSize + (normalized * (maxSize - minSize))}rem`;
    };

    // Vibrant Color Palette
    const COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
        '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ];

    const getColor = (index: number) => COLORS[index % COLORS.length];

    const showStats = mode === 'stats' || mode === 'both';
    const showCloud = mode === 'cloud' || mode === 'both';

    return (
        <div className={`grid gap-6 h-full ${mode === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} print:grid-cols-1`}>
            {/* Stats Column */}
            {showStats && (
                <Card className="bg-card/50 print:bg-white print:border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Hash className="w-4 h-4 text-primary" /> Text Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col p-3 bg-background rounded-lg border print:border-gray-300">
                            <span className="text-xs text-muted-foreground">Words</span>
                            <span className="text-2xl font-bold">{stats.word_count.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-background rounded-lg border print:border-gray-300">
                            <span className="text-xs text-muted-foreground">Sentences</span>
                            <span className="text-2xl font-bold">{stats.sentence_count.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-background rounded-lg border print:border-gray-300">
                            <span className="text-xs text-muted-foreground">Avg Word Len</span>
                            <span className="text-2xl font-bold">{stats.avg_word_length}</span>
                        </div>
                        <div className="flex flex-col p-3 bg-background rounded-lg border print:border-gray-300">
                            <span className="text-xs text-muted-foreground">Characters</span>
                            <span className="text-2xl font-bold">{stats.char_count.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Word Cloud Column */}
            {showCloud && (
                <Card className="bg-card/50 print:bg-white print:break-inside-avoid">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Cloud className="w-4 h-4 text-primary" /> Topic Word Cloud
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {wordCloudImage ? (
                            <div className="rounded-lg overflow-hidden border bg-white flex items-center justify-center p-2 h-full min-h-[250px]">
                                <img
                                    src={`data:image/png;base64,${wordCloudImage}`}
                                    alt="Global Word Cloud"
                                    className="w-full h-auto object-contain max-h-[300px]"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 p-4 justify-center items-center bg-background rounded-lg border min-h-[200px] h-full overflow-y-auto max-h-[250px] print:max-h-none print:overflow-visible print:border-none">
                                {wordCloud && wordCloud.slice(0, 50).map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="font-bold hover:opacity-80 transition-opacity cursor-default"
                                        style={{
                                            fontSize: getFontSize(item.count),
                                            color: getColor(idx),
                                            opacity: 0.8 + (item.count / maxCount * 0.2)
                                        }}
                                        title={`${item.phrase}: ${item.count}`}
                                    >
                                        {item.phrase}
                                    </span>
                                ))}
                                {!wordCloud && <p className="text-muted-foreground text-sm">No word cloud data available.</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
