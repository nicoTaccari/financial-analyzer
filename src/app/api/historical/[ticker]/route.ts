import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FinancialDataAggregator } from "@/lib/data/aggregator";

const tickerSchema = z.string().regex(/^[A-Z]{1,5}$/, "Invalid ticker format");
const timeframeSchema = z.enum(["1M", "3M", "6M", "1Y", "2Y", "5Y"]).optional();

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const startTime = Date.now();

  try {
    // Validate ticker
    const ticker = tickerSchema.parse(params.ticker.toUpperCase());

    // Get timeframe from query params
    const { searchParams } = new URL(request.url);
    const timeframe = timeframeSchema.parse(
      searchParams.get("timeframe") || "1Y"
    );

    console.log(
      `📈 Starting historical data fetch for ${ticker} (${timeframe})`
    );

    // Get historical data with source info
    const { data, source } =
      await FinancialDataAggregator.getHistoricalDataWithSource(
        ticker,
        timeframe
      );

    console.log(`📊 Historical data source: ${source}`);

    const result = {
      ticker,
      timeframe,
      data,
      source,
      processingTime: Date.now() - startTime,
      dataPoints: data.data.length,
      dateRange: {
        start: data.data[0]?.date,
        end: data.data[data.data.length - 1]?.date,
      },
      priceRange: {
        min: Math.min(...data.data.map((d) => d.low)),
        max: Math.max(...data.data.map((d) => d.high)),
        start: data.data[0]?.close,
        end: data.data[data.data.length - 1]?.close,
      },
      volumeStats: {
        total: data.data.reduce((sum, d) => sum + d.volume, 0),
        average:
          data.data.reduce((sum, d) => sum + d.volume, 0) / data.data.length,
        max: Math.max(...data.data.map((d) => d.volume)),
      },
    };

    console.log(
      `✅ Historical data completed for ${ticker} - ${data.data.length} points - Time: ${result.processingTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Historical data error for ${params.ticker} (${processingTime}ms):`,
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Invalid request parameters",
        },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Historical data fetch failed";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTime,
      },
      { status: 500 }
    );
  }
}
