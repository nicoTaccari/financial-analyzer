import {
  TrendingUp,
  TrendingDown,
  Star,
  StarOff,
  BarChart3,
  Calendar,
} from "lucide-react";
import { formatLargeNumber } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface StockResultCardProps {
  result: AnalysisResult;
  isInWatchlist: boolean;
  isInComparison: boolean;
  onAddToWatchlist: () => void;
  onAddToComparison: () => void;
}

export function StockResultCard({
  result,
  isInWatchlist,
  isInComparison,
  onAddToWatchlist,
  onAddToComparison,
}: StockResultCardProps) {
  const getRecommendationColor = (rec: string) => {
    if (rec === "BUY")
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (rec === "HOLD") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h2 className="text-3xl font-bold">
                {result.stockData.companyName}
              </h2>
              <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                {result.ticker}
              </span>
            </div>

            <div className="flex items-center space-x-8 text-xl">
              <span className="text-5xl font-bold">
                ${result.stockData.price.toFixed(2)}
              </span>
              <div
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                  result.stockData.change >= 0
                    ? "bg-emerald-500/20 text-emerald-100"
                    : "bg-red-500/20 text-red-100"
                }`}
              >
                {result.stockData.change >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <span className="text-xl font-bold">
                  {result.stockData.change >= 0 ? "+" : ""}
                  {result.stockData.change.toFixed(2)} (
                  {result.stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-6xl font-bold mb-3 text-white">
              {result.score.overall.toFixed(0)}
            </div>
            <div
              className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-bold border-2 ${getRecommendationColor(
                result.score.recommendation
              )}`}
            >
              {result.score.recommendation}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Volume",
              value: formatLargeNumber(result.stockData.volume || 0),
            },
            {
              label: "Market Cap",
              value:
                result.stockData.marketCap > 0
                  ? `$${formatLargeNumber(result.stockData.marketCap)}`
                  : "N/A",
            },
            {
              label: "Confidence",
              value: `${result.score.confidence}%`,
            },
            { label: "Risk Level", value: result.score.riskLevel },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-sm opacity-90 font-medium mb-1">
                {item.label}
              </div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onAddToWatchlist}
              disabled={isInWatchlist}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isInWatchlist ? (
                <Star className="w-5 h-5 fill-current" />
              ) : (
                <StarOff className="w-5 h-5" />
              )}
              <span>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
            </button>

            <button
              onClick={onAddToComparison}
              disabled={isInComparison}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              <BarChart3 className="w-5 h-5" />
              <span>
                {isInComparison ? "Already Comparing" : "Add to Compare"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                Updated: {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {/* Data Sources */}
            {(result as any).sources && (
              <div className="flex items-center space-x-4 text-xs font-medium">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Stock: {(result as any).sources.stockData}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Metrics: {(result as any).sources.metrics}</span>
                </span>
                {(result as any).processingTime && (
                  <span className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{(result as any).processingTime}ms</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
