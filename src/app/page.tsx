"use client";

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
import { useStockAnalysis } from "@/hooks/useStockAnalysis";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useCallback } from "react";

export default function Home() {
  const { result, loading, error, analyzeStock, clearAnalysis } =
    useStockAnalysis();
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

  // Combined analyze function that handles both stock analysis and historical data
  const handleAnalyze = useCallback(
    async (ticker: string) => {
      if (!ticker.trim()) return;

      // Clear previous data
      clearAnalysis();
      clearHistoricalData();

      // Start both analyses in parallel
      const analysisPromise = analyzeStock(ticker);
      const historyPromise = fetchHistoricalData(ticker, selectedTimeframe);

      // Wait for both to complete
      await Promise.all([analysisPromise, historyPromise]);
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

        {/* Loading State */}
        {loading && <LoadingState ticker={result?.ticker || ""} />}

        {/* Error State */}
        {error && (
          <ErrorState error={error} onDismiss={() => clearAnalysis()} />
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Stock Result Card */}
            <StockResultCard
              result={result}
              isInWatchlist={isInWatchlist(result.ticker)}
              isInComparison={isInComparison(result.ticker)}
              onAddToWatchlist={handleAddToWatchlist}
              onAddToComparison={handleAddToComparison}
            />

            {/* Analysis Tabs */}
            <AnalysisTabs
              result={result}
              historicalData={historicalData}
              chartLoading={chartLoading}
              chartError={chartError}
              onTimeframeChange={handleTimeframeChange}
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
