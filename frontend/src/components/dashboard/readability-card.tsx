'use client';
import { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import type { ReadabilityMetrics } from '@/types';

interface ReadabilityCardProps {
    readability: ReadabilityMetrics;
}

export default function ReadabilityCard({ readability }: ReadabilityCardProps) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true) }, []);
    
    const score = readability.score;
    const chartData = [{ name: 'score', value: score }];
    
    const scoreColor = score > 75 ? 'hsl(var(--chart-2))' : score > 50 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-1))';

    return (
        <Card className={cn("bg-card border h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20")}>
            <CardHeader>
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Readability</CardTitle>
                    <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Flesch Reading Ease score.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[160px] w-full relative">
                    {isClient ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    innerRadius="75%" 
                                    outerRadius="95%" 
                                    data={chartData} 
                                    startAngle={180} 
                                    endAngle={-180}
                                    barSize={20}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                                    <RadialBar 
                                        dataKey="value" 
                                        cornerRadius={10} 
                                        background={{ fill: 'hsl(var(--muted))' }}
                                        fill={scoreColor}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-4xl font-headline font-bold">{score.toFixed(1)}</p>
                            </div>
                        </>
                    ) : <Skeleton className="h-full w-full" />}
                </div>
                <p className="text-center text-muted-foreground mt-2">
                    Equivalent to a <span className="font-bold text-foreground">{readability.gradeLevel}</span> reading level.
                </p>
            </CardContent>
        </Card>
    );
}
