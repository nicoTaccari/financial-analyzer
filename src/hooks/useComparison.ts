import { useState, useCallback } from "react";
import type { AnalysisResult } from "@/types";

export function useComparison() {
  const [comparison, setComparison] = useState<AnalysisResult[]>([]);

  const addToComparison = useCallback((result: AnalysisResult) => {
    setComparison((prev) => {
      if (!prev.find((c) => c.ticker === result.ticker)) {
        return [...prev, result];
      }
      return prev;
    });
  }, []);

  const removeFromComparison = useCallback((ticker: string) => {
    setComparison((prev) => prev.filter((c) => c.ticker !== ticker));
  }, []);

  const clearComparison = useCallback(() => {
    setComparison([]);
  }, []);

  const isInComparison = useCallback(
    (ticker: string) => {
      return comparison.some((c) => c.ticker === ticker);
    },
    [comparison]
  );

  return {
    comparison,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
  };
}
