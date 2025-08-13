import { LineChart } from "lucide-react";

interface ChartLoadingStateProps {
  ticker?: string;
}

export function ChartLoadingState({ ticker }: ChartLoadingStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <div className="relative">
        <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <LineChart className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        Loading Chart Data {ticker && `for ${ticker}`}
      </h3>
      <p className="text-lg text-slate-600 mb-2">
        Fetching historical prices...
      </p>
      <p className="text-sm text-slate-500">This may take a few seconds</p>
    </div>
  );
}
