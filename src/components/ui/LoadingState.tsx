import { BarChart3 } from "lucide-react";

interface LoadingStateProps {
  ticker: string;
}

export function LoadingState({ ticker }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
      <div className="relative">
        <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        Analyzing {ticker}
      </h3>
      <p className="text-lg text-slate-600 mb-2">
        Fetching real-time market data...
      </p>
      <p className="text-sm text-slate-500">This may take a few seconds</p>

      <div className="mt-6 flex justify-center space-x-8 text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Alpha Vantage API</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>AI Analysis</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>Scoring Engine</span>
        </div>
      </div>
    </div>
  );
}
