import { BarChart3, Target, Activity } from "lucide-react";

interface HeaderProps {
  watchlistCount: number;
  comparisonCount: number;
}

export function Header({ watchlistCount, comparisonCount }: HeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Financial Analyzer
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  AI-Powered Investment Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg">
              <Target className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Watchlist: {watchlistCount}
              </span>
            </div>

            {comparisonCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Comparing: {comparisonCount}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-100 rounded-lg">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                Live Data
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
