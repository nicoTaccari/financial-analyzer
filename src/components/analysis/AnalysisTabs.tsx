// src/components/analysis/AnalysisTabs.tsx
import { useState } from "react";
import { BarChart3, DollarSign, LineChart, Activity } from "lucide-react";
import { ScoreOverview } from "./tabs/ScoreOverview";

import { ChartsTab } from "./tabs/ChartsTab";

import type { AnalysisResult, HistoricalData } from "@/types";
import { MetricsTab } from "./tabs/MetricsTab";
import { AIAnalysisTab } from "./tabs/AIAnalysisTab";

interface AnalysisTabsProps {
  result: AnalysisResult;
  historicalData: HistoricalData | null;
  chartLoading: boolean;
  chartError: string;
  onTimeframeChange: (
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ) => void;
}

type TabId = "overview" | "metrics" | "charts" | "analysis";

export function AnalysisTabs({
  result,
  historicalData,
  chartLoading,
  chartError,
  onTimeframeChange,
}: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs = [
    { id: "overview" as const, name: "Score Overview", icon: BarChart3 },
    { id: "metrics" as const, name: "Financial Metrics", icon: DollarSign },
    { id: "charts" as const, name: "Price Charts", icon: LineChart },
    { id: "analysis" as const, name: "AI Analysis", icon: Activity },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50">
        <nav className="flex space-x-8 px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-700 bg-blue-50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
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
        {activeTab === "analysis" && <AIAnalysisTab result={result} />}
      </div>
    </div>
  );
}
