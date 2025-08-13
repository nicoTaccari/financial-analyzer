// src/components/analysis/StockComparison.tsx
import { BarChart3 } from "lucide-react";
import { formatNumber, formatPercentage } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface StockComparisonProps {
  comparison: AnalysisResult[];
  onClearComparison: () => void;
}

export function StockComparison({
  comparison,
  onClearComparison,
}: StockComparisonProps) {
  if (comparison.length === 0) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === "BUY")
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (rec === "HOLD") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
          <BarChart3 className="w-7 h-7" />
          <span>Stock Comparison ({comparison.length} stocks)</span>
        </h3>
        <button
          onClick={onClearComparison}
          className="px-4 py-2 text-slate-600 hover:text-red-600 font-medium rounded-lg transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                Symbol
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                Price
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                Change
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                Score
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                Recommendation
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                P/E
              </th>
              <th className="text-left py-4 px-6 font-bold text-slate-900">
                ROE
              </th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((stock, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
              >
                <td className="py-4 px-6 font-bold text-slate-900">
                  {stock.ticker}
                </td>
                <td className="py-4 px-6 font-semibold text-slate-800">
                  ${stock.stockData.price.toFixed(2)}
                </td>
                <td
                  className={`py-4 px-6 font-semibold ${
                    stock.stockData.changePercent >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {stock.stockData.changePercent >= 0 ? "+" : ""}
                  {stock.stockData.changePercent.toFixed(2)}%
                </td>
                <td
                  className={`py-4 px-6 font-bold text-lg ${getScoreColor(
                    stock.score.overall
                  )}`}
                >
                  {stock.score.overall.toFixed(0)}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-bold border ${getRecommendationColor(
                      stock.score.recommendation
                    )}`}
                  >
                    {stock.score.recommendation}
                  </span>
                </td>
                <td className="py-4 px-6 font-medium text-slate-700">
                  {formatNumber(stock.metrics.peRatio, 1)}
                </td>
                <td className="py-4 px-6 font-medium text-slate-700">
                  {formatPercentage(stock.metrics.roe)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
