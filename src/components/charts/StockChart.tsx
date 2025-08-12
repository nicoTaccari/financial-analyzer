// Create this file: src/components/charts/StockChart.tsx
"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import type { HistoricalData } from "@/types";

interface StockChartProps {
  data: HistoricalData;
  loading?: boolean;
  error?: string;
  onTimeframeChange?: (
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ) => void;
}

type ChartType = "price" | "volume" | "combined";

export function StockChart({
  data,
  loading,
  error,
  onTimeframeChange,
}: StockChartProps) {
  const [chartType, setChartType] = useState<ChartType>("price");
  const [selectedTimeframe, setSelectedTimeframe] = useState(data.timeframe);

  // Process data for charts
  const chartData = useMemo(() => {
    return data.data.map((point, index) => {
      const prevClose = index > 0 ? data.data[index - 1].close : point.open;
      const change = point.close - prevClose;
      const changePercent = (change / prevClose) * 100;

      return {
        ...point,
        change,
        changePercent,
        dateFormatted: new Date(point.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          ...(data.timeframe === "2Y" || data.timeframe === "5Y"
            ? { year: "2-digit" }
            : {}),
        }),
        volumeInMillions: point.volume / 1000000,
      };
    });
  }, [data]);

  const priceRange = useMemo(() => {
    const prices = chartData.map((d) => d.close);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      change:
        chartData.length > 1
          ? chartData[chartData.length - 1].close - chartData[0].close
          : 0,
    };
  }, [chartData]);

  const timeframes: Array<{ key: typeof selectedTimeframe; label: string }> = [
    { key: "1M", label: "1M" },
    { key: "3M", label: "3M" },
    { key: "6M", label: "6M" },
    { key: "1Y", label: "1Y" },
    { key: "2Y", label: "2Y" },
    { key: "5Y", label: "5Y" },
  ];

  const chartTypes: Array<{ key: ChartType; label: string; icon: any }> = [
    { key: "price", label: "Price", icon: TrendingUp },
    { key: "volume", label: "Volume", icon: BarChart3 },
    { key: "combined", label: "Combined", icon: Activity },
  ];

  const handleTimeframeChange = (timeframe: typeof selectedTimeframe) => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded-lg mb-6 w-1/3"></div>
          <div className="h-80 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Chart Error
          </div>
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Chart Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {data.symbol} Price Chart
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-600">
                {chartData.length} data points
              </span>
              <span
                className={`flex items-center space-x-1 font-semibold ${
                  priceRange.change >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {priceRange.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {priceRange.change >= 0 ? "+" : ""}$
                  {priceRange.change.toFixed(2)} (
                  {(
                    (priceRange.change / chartData[0]?.close || 1) * 100
                  ).toFixed(1)}
                  %)
                </span>
              </span>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-2">
            {timeframes.map((tf) => (
              <button
                key={tf.key}
                onClick={() => handleTimeframeChange(tf.key)}
                disabled={loading}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedTimeframe === tf.key
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2 mt-4">
          {chartTypes.map((type) => (
            <button
              key={type.key}
              onClick={() => setChartType(type.key)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                chartType === type.key
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {chartType === "price" && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateFormatted"
                stroke="#64748b"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                domain={["dataMin - 5", "dataMax + 5"]}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-900 mb-2">
                          {label}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-600">
                            Open:{" "}
                            <span className="font-medium">
                              ${data.open.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-600">
                            High:{" "}
                            <span className="font-medium text-emerald-600">
                              ${data.high.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-600">
                            Low:{" "}
                            <span className="font-medium text-red-600">
                              ${data.low.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-600">
                            Close:{" "}
                            <span className="font-medium">
                              ${data.close.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-600">
                            Volume:{" "}
                            <span className="font-medium">
                              {(data.volume / 1000000).toFixed(1)}M
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === "volume" && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateFormatted"
                stroke="#64748b"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-900 mb-2">
                          {label}
                        </p>
                        <p className="text-slate-600">
                          Volume:{" "}
                          <span className="font-medium">
                            {(data.volume / 1000000).toFixed(1)}M
                          </span>
                        </p>
                        <p className="text-slate-600">
                          Price:{" "}
                          <span className="font-medium">
                            ${data.close.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="volumeInMillions"
                fill="#8b5cf6"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "combined" && (
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateFormatted"
                stroke="#64748b"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis
                yAxisId="volume"
                orientation="left"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(0)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
                        <p className="font-semibold text-slate-900 mb-2">
                          {label}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-slate-600">
                            Price:{" "}
                            <span className="font-medium">
                              ${data.close.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-slate-600">
                            Volume:{" "}
                            <span className="font-medium">
                              {(data.volume / 1000000).toFixed(1)}M
                            </span>
                          </p>
                          <p
                            className={`${
                              data.change >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            Change:{" "}
                            <span className="font-medium">
                              {data.change >= 0 ? "+" : ""}$
                              {data.change.toFixed(2)} (
                              {data.changePercent.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="volume"
                dataKey="volumeInMillions"
                fill="#e5e7eb"
                opacity={0.6}
                radius={[1, 1, 0, 0]}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Chart Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 font-medium">
              Period High
            </div>
            <div className="text-lg font-bold text-emerald-600">
              ${priceRange.max.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 font-medium">Period Low</div>
            <div className="text-lg font-bold text-red-600">
              ${priceRange.min.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 font-medium">
              Total Return
            </div>
            <div
              className={`text-lg font-bold ${
                priceRange.change >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {((priceRange.change / (chartData[0]?.close || 1)) * 100).toFixed(
                1
              )}
              %
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="text-sm text-slate-600 font-medium">Avg Volume</div>
            <div className="text-lg font-bold text-slate-900">
              {(
                chartData.reduce((sum, d) => sum + d.volume, 0) /
                chartData.length /
                1000000
              ).toFixed(1)}
              M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
