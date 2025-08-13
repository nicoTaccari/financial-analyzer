import { LineChart, AlertTriangle } from "lucide-react";
import { StockChart } from "@/components/charts/StockChart";

import type { AnalysisResult, HistoricalData } from "@/types";
import { ChartLoadingState } from "@/components/ui/ChartLoadingState";
import { EmptyState } from "@/components/ui/EmptyState";

interface ChartsTabProps {
  result: AnalysisResult;
  historicalData: HistoricalData | null;
  chartLoading: boolean;
  chartError: string;
  onTimeframeChange: (
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ) => void;
}

export function ChartsTab({
  result,
  historicalData,
  chartLoading,
  chartError,
  onTimeframeChange,
}: ChartsTabProps) {
  if (chartLoading) {
    return <ChartLoadingState ticker={result.ticker} />;
  }

  if (chartError) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Chart Data Error
            </h3>
            <p className="text-red-800 text-lg mb-3">{chartError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!historicalData) {
    return (
      <EmptyState
        icon={<LineChart className="w-16 h-16 text-slate-400 mx-auto" />}
        title="No Chart Data Available"
        description="Chart data should load automatically when analyzing a stock"
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
          <LineChart className="w-7 h-7" />
          <span>Price Charts & Technical Analysis</span>
        </h3>
        <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
          {historicalData.data.length} data points
        </div>
      </div>

      <StockChart
        data={historicalData}
        loading={chartLoading}
        error={chartError}
        onTimeframeChange={onTimeframeChange}
      />

      {/* Quick Analysis */}
      <div className="mt-8 bg-slate-50 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Quick Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Price Movement
            </div>
            <div
              className={`text-lg font-bold ${
                historicalData.data[historicalData.data.length - 1]?.close >
                historicalData.data[0]?.close
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {(
                ((historicalData.data[historicalData.data.length - 1]?.close -
                  historicalData.data[0]?.close) /
                  historicalData.data[0]?.close) *
                100
              ).toFixed(1)}
              %
            </div>
            <div className="text-xs text-slate-500">
              {historicalData.timeframe} period return
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Volatility
            </div>
            <div className="text-lg font-bold text-slate-900">
              {(() => {
                const returns = historicalData.data
                  .slice(1)
                  .map((point, i) =>
                    Math.log(point.close / historicalData.data[i].close)
                  );
                const variance =
                  returns.reduce((sum, ret) => sum + ret * ret, 0) /
                  returns.length;
                return (Math.sqrt(variance) * Math.sqrt(252) * 100).toFixed(1);
              })()}
              %
            </div>
            <div className="text-xs text-slate-500">Annualized volatility</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Trend Strength
            </div>
            <div className="text-lg font-bold text-blue-600">
              {(() => {
                const closes = historicalData.data.map((d) => d.close);
                const upDays = closes
                  .slice(1)
                  .filter((close, i) => close > closes[i]).length;
                return Math.round((upDays / (closes.length - 1)) * 100);
              })()}
              %
            </div>
            <div className="text-xs text-slate-500">Positive days ratio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
