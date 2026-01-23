'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import type { Keyword } from '@/types';

interface KeywordDensityCardProps {
    keywords: Keyword[];
}

export default function KeywordDensityCard({ keywords }: KeywordDensityCardProps) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => { setIsClient(true) }, []);

    return (
        <Card className={cn("bg-card border h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20")}>
            <CardHeader>
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Keyword Density</CardTitle>
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Most frequent terms found in the text.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[240px] w-full">
                    {isClient ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={keywords} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="term" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={110} 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={14}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                    cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
                                    formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Density']}
                                />
                                <Bar dataKey="density" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <Skeleton className="h-full w-full" />}
                </div>
            </CardContent>
        </Card>
    );
}
