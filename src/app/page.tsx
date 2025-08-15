// src/app/page-optimized.tsx
"use client";

import { useEffect, useCallback } from "react";
import { AnalysisTabs } from "@/components/analysis/AnalysisTabs";
import { StockComparison } from "@/components/analysis/StockComparison";
import { StockResultCard } from "@/components/analysis/StockResultCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SearchSection } from "@/components/search/SearchSection";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useComparison } from "@/hooks/useComparison";
import { useHistoricalData } from "@/hooks/useHistoricalData";

import { useWatchlist } from "@/hooks/useWatchlist";
import { useStockAnalysis } from "@/hooks/useStockAnalysis";

// Popular stocks for prefetching
const POPULAR_STOCKS = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA"];

export default function Home() {
  const {
    result,
    loading,
    error,
    isPartial,
    aiLoading,
    analyzeStock,
    clearAnalysis,
    prefetchAnalysis,
  } = useStockAnalysis();

  const {
    historicalData,
    chartLoading,
    chartError,
    selectedTimeframe,
    fetchHistoricalData,
    clearHistoricalData,
  } = useHistoricalData();

  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatchlist();
  const { comparison, addToComparison, clearComparison, isInComparison } =
    useComparison();

  // Prefetch popular stocks on mount
  useEffect(() => {
    const prefetchPopular = async () => {
      // Prefetch after a short delay to not block initial render
      setTimeout(() => {
        POPULAR_STOCKS.forEach((ticker) => {
          prefetchAnalysis(ticker);
        });
      }, 2000);
    };

    prefetchPopular();
  }, [prefetchAnalysis]);

  // Optimized analyze function with progressive loading
  const handleAnalyze = useCallback(
    async (ticker: string) => {
      if (!ticker.trim()) return;

      console.log(`🎯 Starting optimized analysis for ${ticker}`);

      // Clear previous data
      clearAnalysis();
      clearHistoricalData();

      // Start stock analysis (this will now return basic data quickly)
      const analysisPromise = analyzeStock(ticker);

      // Start historical data fetch in parallel but don't wait for it
      setTimeout(() => {
        fetchHistoricalData(ticker, selectedTimeframe);
      }, 500); // Small delay to prioritize main analysis

      // Wait for basic analysis (should be fast)
      await analysisPromise;
    },
    [
      analyzeStock,
      fetchHistoricalData,
      selectedTimeframe,
      clearAnalysis,
      clearHistoricalData,
    ]
  );

  // Handle watchlist operations
  const handleAddToWatchlist = useCallback(() => {
    if (result) {
      addToWatchlist(result.ticker);
    }
  }, [result, addToWatchlist]);

  // Handle comparison operations
  const handleAddToComparison = useCallback(() => {
    if (result) {
      addToComparison(result);
    }
  }, [result, addToComparison]);

  // Handle timeframe changes for charts
  const handleTimeframeChange = useCallback(
    (timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y") => {
      if (result) {
        fetchHistoricalData(result.ticker, timeframe);
      }
    },
    [result, fetchHistoricalData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header
        watchlistCount={watchlist.length}
        comparisonCount={comparison.length}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchSection
          onAnalyze={handleAnalyze}
          loading={loading}
          watchlist={watchlist}
          onRemoveFromWatchlist={removeFromWatchlist}
        />

        {/* Loading State - Show only for initial load */}
        {loading && !result && <LoadingState ticker={""} />}

        {/* Error State */}
        {error && !result && (
          <ErrorState error={error} onDismiss={() => clearAnalysis()} />
        )}

        {/* Results Section with Progressive Loading */}
        {result && (
          <div className="space-y-8">
            {/* Stock Result Card with AI Loading Indicator */}
            <div className="relative">
              <StockResultCard
                result={result}
                isInWatchlist={isInWatchlist(result.ticker)}
                isInComparison={isInComparison(result.ticker)}
                onAddToWatchlist={handleAddToWatchlist}
                onAddToComparison={handleAddToComparison}
              />

              {/* Progressive Loading Indicators */}
              {isPartial && (
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium animate-pulse">
                  {aiLoading
                    ? "🤖 AI Analysis Loading..."
                    : "⚡ Quick Analysis"}
                </div>
              )}
            </div>

            {/* Analysis Tabs with AI Loading State */}
            <AnalysisTabs
              result={result}
              historicalData={historicalData}
              chartLoading={chartLoading}
              chartError={chartError}
              onTimeframeChange={handleTimeframeChange}
              aiLoading={aiLoading}
              isPartial={isPartial}
            />
          </div>
        )}

        {/* Stock Comparison */}
        <StockComparison
          comparison={comparison}
          onClearComparison={clearComparison}
        />

        <Footer />
      </div>
    </div>
  );
}
