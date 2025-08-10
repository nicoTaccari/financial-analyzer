import { NextRequest, NextResponse } from "next/server";
import { FinancialDataAggregator } from "@/lib/data/aggregator";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    const { stockData, metrics, sources } =
      await FinancialDataAggregator.getDataWithSources(ticker);

    return NextResponse.json({
      success: true,
      debug: {
        ticker,
        sources,
        rawStockData: stockData,
        rawMetrics: metrics,
        metricsAvailable: Object.entries(metrics).filter(
          ([_, value]) => value !== null
        ).length,
        totalMetrics: Object.keys(metrics).length,
        coverage: `${Math.round(
          (Object.entries(metrics).filter(([_, value]) => value !== null)
            .length /
            Object.keys(metrics).length) *
            100
        )}%`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Debug failed",
        ticker,
      },
      { status: 500 }
    );
  }
}
