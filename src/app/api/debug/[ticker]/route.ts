import { NextRequest, NextResponse } from "next/server";
import { FinancialDataAggregator } from "@/lib/data/aggregator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    // Await params in Next.js 14+
    const { ticker: rawTicker } = await params;
    const ticker = rawTicker.toUpperCase();

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
    let errorTicker = "unknown";
    try {
      const { ticker } = await params;
      errorTicker = ticker;
    } catch {
      // If params can't be accessed, use "unknown"
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Debug failed",
        ticker: errorTicker,
      },
      { status: 500 }
    );
  }
}
