import type { AnalysisResult } from "@/types";

interface ScoreOverviewProps {
  result: AnalysisResult;
}

export function ScoreOverview({ result }: ScoreOverviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Investment Score Breakdown
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(result.score.breakdown).map(([category, score]) => (
          <div
            key={category}
            className={`rounded-xl p-6 border-2 ${getScoreBgColor(
              score as number
            )}`}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                {category.replace(/([A-Z])/g, " $1").trim()}
              </div>
              <div
                className={`text-4xl font-bold mb-4 ${getScoreColor(
                  score as number
                )}`}
              >
                {(score as number).toFixed(0)}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    (score as number) >= 75
                      ? "bg-emerald-500"
                      : (score as number) >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
