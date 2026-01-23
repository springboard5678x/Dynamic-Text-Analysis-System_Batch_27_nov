'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/types';
import { analyzeTextClient } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

import AnalysisForm from '@/components/analysis-form';
import Dashboard from '@/components/dashboard';
import LoadingState from '@/components/loading-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import BrainBackground from '@/components/phoenix-background';

export default function AnalysisPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async (inputData: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    const result = await analyzeTextClient(inputData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
      setAnalysisResult(null);
    } else if (result.data) {
      setAnalysisResult(result.data);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  return (
    <main className="h-[calc(100vh-4rem)] flex flex-col relative">
      <BrainBackground />
      <div className="flex-grow flex flex-col items-center w-full relative overflow-hidden">
        <ScrollArea className="w-full h-full">
          <div className="container px-4 md:px-6 py-12 flex flex-col justify-end min-h-full">

            {isLoading && (
              <div className="w-full max-w-7xl mx-auto mb-8">
                <LoadingState />
              </div>
            )}

            {analysisResult && !isLoading && (
              <div className="w-full max-w-7xl mx-auto mb-8 animate-fade-in-up">
                <Dashboard data={analysisResult} onReset={handleReset} />
              </div>
            )}

            {!analysisResult && !isLoading && (
              <div className="text-center max-w-3xl mx-auto flex-grow flex flex-col justify-center items-center">
                <div className="animate-scroll" style={{ animationDelay: '100ms' }}>
                  <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                    AI-Powered Analysis
                  </h1>
                  <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
                    From raw text to actionable intelligence. Paste, upload, and discover insights in seconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="sticky bottom-0 w-full flex-shrink-0 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-4">
          <div className="container px-4 md:px-6">
            <AnalysisForm onAnalyze={handleAnalysis} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
}
