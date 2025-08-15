// src/components/analysis/tabs/AIAnalysisTab.tsx
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Brain,
  Zap,
} from "lucide-react";
import type { AnalysisResult } from "@/types";

interface AIAnalysisTabProps {
  result: AnalysisResult;
  aiLoading?: boolean;
  isPartial?: boolean;
}

export function AIAnalysisTab({
  result,
  aiLoading = false,
  isPartial = false,
}: AIAnalysisTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
          <Activity className={`w-7 h-7 ${aiLoading ? "animate-spin" : ""}`} />
          <span>AI-Powered Analysis</span>
        </h3>
        <div className="flex items-center space-x-3">
          {aiLoading && (
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-lg animate-pulse flex items-center space-x-2">
              <Brain className="w-4 h-4 animate-pulse" />
              <span>Generating insights...</span>
            </span>
          )}
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            {(result as any).aiProvider || "Enhanced Analysis"}
          </span>
        </div>
      </div>

      {/* AI Loading State */}
      {aiLoading && isPartial && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-lg mb-2">
                🧠 Advanced AI Analysis in Progress
              </h4>
              <p className="text-blue-800 mb-3">
                Our AI is analyzing market patterns, sector trends, and
                financial indicators to provide deeper insights...
              </p>
              <div className="flex items-center space-x-4 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <span>Analyzing fundamentals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span>Evaluating risks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span>Identifying catalysts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Analysis Badge for Partial Results */}
      {isPartial && !aiLoading && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800 font-medium">
              ⚡ Quick analysis complete • Enhanced AI insights have been loaded
            </span>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <span>📋 Executive Summary</span>
          </h4>
          {aiLoading && isPartial ? (
            <div className="space-y-3">
              <div className="h-4 bg-blue-200 rounded animate-pulse"></div>
              <div className="h-4 bg-blue-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-blue-200 rounded w-1/2 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-blue-800 leading-relaxed text-lg">
              {result.aiAnalysis.summary}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h4 className="font-bold text-emerald-900 text-lg mb-4 flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <span>✅ Strengths</span>
            </h4>
            {aiLoading && isPartial ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full mt-2 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-emerald-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="font-bold text-red-900 text-lg mb-4 flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <span>⚠️ Weaknesses</span>
            </h4>
            {aiLoading && isPartial ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-300 rounded-full mt-2 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-red-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h4 className="font-bold text-amber-900 text-lg mb-4 flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6" />
              <span>🚨 Key Risks</span>
            </h4>
            {aiLoading && isPartial ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-300 rounded-full mt-2 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-amber-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-3">
                {result.aiAnalysis.keyRisks.map(
                  (risk: string, index: number) => (
                    <li
                      key={index}
                      className="text-amber-800 flex items-start space-x-3"
                    >
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{risk}</span>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center space-x-3">
              <TrendingUp className="w-6 h-6" />
              <span>🚀 Catalysts</span>
            </h4>
            {aiLoading && isPartial ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-3 bg-purple-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center space-x-3">
            <Briefcase className="w-6 h-6" />
            <span>💡 Investment Recommendation</span>
          </h4>
          {aiLoading && isPartial ? (
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-3/5 animate-pulse"></div>
            </div>
          ) : (
            <p className="text-slate-800 leading-relaxed text-lg">
              {result.aiAnalysis.recommendationReasoning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
