// src/components/analysis/AnalysisTabs.tsx
import { useState } from "react";
import { BarChart3, DollarSign, LineChart, Activity } from "lucide-react";
import { ScoreOverview } from "./tabs/ScoreOverview";

import { MetricsTab } from "./tabs/MetricsTab";
import { AIAnalysisTab } from "./tabs/AIAnalysisTab";
import type { AnalysisResult, HistoricalData } from "@/types";
import { ChartsTab } from "./tabs/ChartsTab";

interface AnalysisTabsProps {
  result: AnalysisResult;
  historicalData: HistoricalData | null;
  chartLoading: boolean;
  chartError: string;
  onTimeframeChange: (
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ) => void;
  aiLoading?: boolean;
  isPartial?: boolean;
}

type TabId = "overview" | "metrics" | "charts" | "analysis";

export function AnalysisTabs({
  result,
  historicalData,
  chartLoading,
  chartError,
  onTimeframeChange,
  aiLoading = false,
  isPartial = false,
}: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs = [
    { id: "overview" as const, name: "Score Overview", icon: BarChart3 },
    { id: "metrics" as const, name: "Financial Metrics", icon: DollarSign },
    { id: "charts" as const, name: "Price Charts", icon: LineChart },
    {
      id: "analysis" as const,
      name: "AI Analysis",
      icon: Activity,
      loading: aiLoading,
      badge: isPartial ? "Loading..." : undefined,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Performance Indicator Bar */}
      {isPartial && (
        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                ⚡ Quick analysis ready •{" "}
                {aiLoading ? "🤖 AI analysis loading..." : "✅ Complete"}
              </span>
            </div>
            <div className="text-xs opacity-90">
              {aiLoading ? "Advanced insights coming soon" : "All data loaded"}
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-slate-200 bg-slate-50">
        <nav className="flex space-x-8 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-3 py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${tab.loading ? "animate-spin" : ""}`}
              />
              <span>{tab.name}</span>

              {/* Loading Badge */}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-8">
        {activeTab === "overview" && <ScoreOverview result={result} />}
        {activeTab === "metrics" && <MetricsTab result={result} />}
        {activeTab === "charts" && (
          <ChartsTab
            result={result}
            historicalData={historicalData}
            chartLoading={chartLoading}
            chartError={chartError}
            onTimeframeChange={onTimeframeChange}
          />
        )}
        {activeTab === "analysis" && (
          <AIAnalysisTab
            result={result}
            aiLoading={aiLoading}
            isPartial={isPartial}
          />
        )}
      </div>
    </div>
  );
}
