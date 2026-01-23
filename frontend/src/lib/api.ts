import type { AnalysisResult } from '@/types';

const API_URL = 'http://localhost:8000/api/analyze';

export async function analyzeTextClient(inputData: FormData): Promise<{ data: AnalysisResult | null; error: string | null }> {
    try {
        // If inputData doesn't have num_topics, add default
        if (!inputData.has('num_topics')) {
            inputData.append('num_topics', '0');
        }


        const response = await fetch(API_URL, {
            method: 'POST',
            body: inputData,
            // 1 hour timeout - Browsers respect this signal directly
            signal: AbortSignal.timeout(3600000),
        });

        if (!response.ok) {
            const errorText = await response.text();
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
        if (err.name === 'TimeoutError') {
            return { data: null, error: "Analysis timed out after 1 hour. The document might be too large." };
        }
        return { data: null, error: `Failed to connect to analysis server: ${err.message}` };
    }
}
