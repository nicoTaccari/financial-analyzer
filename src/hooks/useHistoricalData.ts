import { useState, useCallback } from "react";
import type { HistoricalData } from "@/types";

export function useHistoricalData() {
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(
    null
  );
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  >("1Y");

  const fetchHistoricalData = useCallback(
    async (
      ticker: string,
      timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
    ) => {
      setChartLoading(true);
      setChartError("");

      try {
        const response = await fetch(
          `/api/historical/${ticker.toUpperCase()}?timeframe=${timeframe}`
        );
        const data = await response.json();

        if (data.success) {
          setHistoricalData(data.data.data);
          setSelectedTimeframe(timeframe);
        } else {
          setChartError(data.error || "Failed to fetch historical data");
        }
      } catch (err) {
        setChartError("Network error while fetching chart data");
      } finally {
        setChartLoading(false);
      }
    },
    []
  );

  const clearHistoricalData = useCallback(() => {
    setHistoricalData(null);
    setChartError("");
  }, []);

  return {
    historicalData,
    chartLoading,
    chartError,
    selectedTimeframe,
    fetchHistoricalData,
    clearHistoricalData,
    setSelectedTimeframe,
  };
}
