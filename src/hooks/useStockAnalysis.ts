// src/hooks/useOptimizedStockAnalysis.ts
import { useState, useCallback, useRef } from "react";
import type { AnalysisResult } from "@/types";

interface OptimizedAnalysisState {
  result: AnalysisResult | null;
  loading: boolean;
  error: string;
  isPartial: boolean;
  aiLoading: boolean;
}

export function useStockAnalysis() {
  const [state, setState] = useState<OptimizedAnalysisState>({
    result: null,
    loading: false,
    error: "",
    isPartial: false,
    aiLoading: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const analyzeStock = useCallback(async (ticker: string) => {
    if (!ticker.trim()) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
      result: null,
      isPartial: false,
      aiLoading: false,
    }));

    try {
      console.log(`🚀 Starting optimized analysis for ${ticker}`);

      // Strategy 1: Fast basic analysis first (skip AI initially)
      const basicResponse = await fetch(
        `/api/analysis/${ticker.toUpperCase()}?skipAI=true`,
        { signal }
      );

      if (!basicResponse.ok) {
        throw new Error(`HTTP ${basicResponse.status}`);
      }

      const basicData = await basicResponse.json();

      if (basicData.success) {
        console.log(`⚡ Fast basic analysis completed for ${ticker}`);

        // Update with basic results immediately
        setState((prev) => ({
          ...prev,
          result: basicData.data,
          loading: false,
          isPartial: true,
          aiLoading: true,
        }));

        // Strategy 2: Then fetch AI analysis in background
        setTimeout(async () => {
          try {
            if (signal.aborted) return;

            console.log(`🤖 Starting AI analysis for ${ticker}`);

            const fullResponse = await fetch(
              `/api/analysis/${ticker.toUpperCase()}`,
              { signal }
            );

            if (!fullResponse.ok) {
              throw new Error(`AI Analysis HTTP ${fullResponse.status}`);
            }

            const fullData = await fullResponse.json();

            if (fullData.success && !signal.aborted) {
              console.log(`🎯 Complete analysis ready for ${ticker}`);

              setState((prev) => ({
                ...prev,
                result: fullData.data,
                isPartial: false,
                aiLoading: false,
              }));
            }
          } catch (aiError) {
            if (!signal.aborted) {
              console.warn(`⚠️ AI analysis failed for ${ticker}:`, aiError);

              // Keep basic results, just mark AI as failed
              setState((prev) => ({
                ...prev,
                aiLoading: false,
                // Keep the partial result, don't show error for AI failure
              }));
            }
          }
        }, 100); // Small delay to let UI update with basic results
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: basicData.error || "Analysis failed",
        }));
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error(`❌ Analysis error for ${ticker}:`, error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Network error",
        }));
      }
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      result: null,
      loading: false,
      error: "",
      isPartial: false,
      aiLoading: false,
    });
  }, []);

  // Prefetch analysis for quick access
  const prefetchAnalysis = useCallback(async (ticker: string) => {
    try {
      // Trigger cache warming without updating UI
      await fetch(`/api/analysis/${ticker.toUpperCase()}?skipAI=true`, {
        method: "HEAD", // Just check if data is cached
      });
      console.log(`🔄 Prefetched data for ${ticker}`);
    } catch (error) {
      console.log(`Failed to prefetch ${ticker}:`, error);
    }
  }, []);

  return {
    result: state.result,
    loading: state.loading,
    error: state.error,
    isPartial: state.isPartial,
    aiLoading: state.aiLoading,
    analyzeStock,
    clearAnalysis,
    prefetchAnalysis,
  };
}
