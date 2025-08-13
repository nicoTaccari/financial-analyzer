// src/hooks/useStockAnalysis.ts
import { useState, useCallback } from "react";
import type { AnalysisResult } from "@/types";

export function useStockAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeStock = useCallback(async (ticker: string) => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/analysis/${ticker.toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setResult(null);
    setError("");
  }, []);

  return {
    result,
    loading,
    error,
    analyzeStock,
    clearAnalysis,
  };
}
