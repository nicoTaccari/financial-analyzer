import { Activity, TrendingUp, AlertTriangle, Briefcase } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface AIAnalysisTabProps {
  result: AnalysisResult;
}

export function AIAnalysisTab({ result }: AIAnalysisTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">
          AI-Powered Analysis
        </h3>
        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
          {(result as any).aiProvider || "Enhanced Analysis"}
        </span>
      </div>

      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <span>📋 Executive Summary</span>
          </h4>
          <p className="text-blue-800 leading-relaxed text-lg">
            {result.aiAnalysis.summary}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h4 className="font-bold text-emerald-900 text-lg mb-4 flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <span>✅ Strengths</span>
            </h4>
            <ul className="space-y-3">
              {result.aiAnalysis.strengths.map(
                (strength: string, index: number) => (
                  <li
                    key={index}
                    className="text-emerald-800 flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="font-bold text-red-900 text-lg mb-4 flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <span>⚠️ Weaknesses</span>
            </h4>
            <ul className="space-y-3">
              {result.aiAnalysis.weaknesses.map(
                (weakness: string, index: number) => (
                  <li
                    key={index}
                    className="text-red-800 flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{weakness}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-amber-900 text-lg mb-4 flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <span>🚨 Key Risks</span>
            </h4>
            <ul className="space-y-3">
              {result.aiAnalysis.keyRisks.map((risk: string, index: number) => (
                <li
                  key={index}
                  className="text-amber-800 flex items-start space-x-3"
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <span>🚀 Catalysts</span>
            </h4>
            <ul className="space-y-3">
              {result.aiAnalysis.catalysts.map(
                (catalyst: string, index: number) => (
                  <li
                    key={index}
                    className="text-purple-800 flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{catalyst}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center space-x-3">
            <Briefcase className="w-6 h-6" />
            <span>💡 Investment Recommendation</span>
          </h4>
          <p className="text-slate-800 leading-relaxed text-lg">
            {result.aiAnalysis.recommendationReasoning}
          </p>
        </div>
      </div>
    </div>
  );
}
