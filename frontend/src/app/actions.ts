'use server';

import type { AnalysisResult } from '@/types';

export async function analyzeText(inputData: FormData): Promise<{ data: AnalysisResult | null; error: string | null }> {
  try {
    // If inputData doesn't have num_topics, adding default
    if (!inputData.has('num_topics')) {
      inputData.append('num_topics', '5');
    }

    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      body: inputData,
      signal: AbortSignal.timeout(3600000), // 1 hour limit (effectively infinite)
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Try to parsing error as JSON if possible
      try {
        const errJson = JSON.parse(errorText);
        if (errJson.detail) return { data: null, error: `Backend Error: ${response.status} - ${errJson.detail}` };
      } catch (e) { }

      return { data: null, error: `Backend Error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    return { data: data as AnalysisResult, error: null };

  } catch (err: any) {
    console.error("Analysis Error:", err);
    return { data: null, error: "Failed to connect to analysis server. Make sure the backend is running at http://localhost:8000" };
  }
}
