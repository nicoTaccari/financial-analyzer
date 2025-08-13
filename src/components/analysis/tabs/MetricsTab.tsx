import type { AnalysisResult } from "@/types";
import { formatNumber, formatPercentage } from "@/lib/utils";

interface MetricsTabProps {
  result: AnalysisResult;
}

export function MetricsTab({ result }: MetricsTabProps) {
  const metrics = [
    {
      label: "P/E Ratio",
      value: formatNumber(result.metrics.peRatio, 1),
      desc: "Price-to-Earnings",
      category: "valuation",
    },
    {
      label: "ROE",
      value: formatPercentage(result.metrics.roe),
      desc: "Return on Equity",
      category: "profitability",
    },
    {
      label: "Debt/Equity",
      value: formatNumber(result.metrics.debtToEquity, 2),
      desc: "Financial Leverage",
      category: "health",
    },
    {
      label: "Net Margin",
      value: formatPercentage(result.metrics.netMargin),
      desc: "Profitability",
      category: "profitability",
    },
    {
      label: "P/B Ratio",
      value: formatNumber(result.metrics.priceToBook, 1),
      desc: "Price-to-Book",
      category: "valuation",
    },
    {
      label: "Current Ratio",
      value: formatNumber(result.metrics.currentRatio, 2),
      desc: "Liquidity",
      category: "health",
    },
    {
      label: "Revenue Growth",
      value: formatPercentage(result.metrics.revenueGrowth),
      desc: "Year-over-Year",
      category: "growth",
    },
    {
      label: "ROA",
      value: formatPercentage(result.metrics.roa),
      desc: "Return on Assets",
      category: "profitability",
    },
  ];

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "valuation":
        return "bg-blue-100 text-blue-700";
      case "profitability":
        return "bg-emerald-100 text-emerald-700";
      case "growth":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Key Financial Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-slate-100 transition-all duration-200 hover:shadow-md"
          >
            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              {metric.label}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {metric.value}
            </div>
            <div className="text-sm text-slate-500 font-medium mb-2">
              {metric.desc}
            </div>
            <div
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryStyle(
                metric.category
              )}`}
            >
              {metric.category}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
