// src/app/api/analysis/[ticker]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { MetricsEngine } from "@/lib/metrics";
import { AIAnalyzer } from "@/lib/ai/analyzer";
import type { AnalysisResult } from "@/types";
import { FinancialDataAggregator } from "@/lib/data/aggregator";

const tickerSchema = z.string().regex(/^[A-Z]{1,5}$/, "Invalid ticker format");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const { ticker: rawTicker } = await params;
    const ticker = tickerSchema.parse(rawTicker.toUpperCase());

    console.log(`🔍 Starting optimized analysis for ${ticker}`);

    // Strategy 1: Return basic data first, stream AI analysis
    const { searchParams } = new URL(request.url);
    const skipAI = searchParams.get("skipAI") === "true";

    // Strategy 2: Get data with faster fallback
    const { stockData, metrics, sources } =
      await FinancialDataAggregator.getDataWithSources(ticker);

    // Strategy 3: Calculate score immediately (fast operation)
    const { score } = MetricsEngine.calculateAll(metrics);

    // Strategy 4: Return early response without AI if requested
    if (skipAI) {
      const basicResult = {
        ticker,
        stockData,
        metrics,
        score,
        aiAnalysis: {
          summary: "AI analysis loading...",
          strengths: ["Analysis in progress"],
          weaknesses: ["Analysis in progress"],
          keyRisks: ["Analysis in progress"],
          catalysts: ["Analysis in progress"],
          recommendationReasoning:
            "Detailed AI analysis will be available shortly",
        },
        timestamp: new Date(),
        sources,
        processingTime: Date.now() - startTime,
        aiProvider: "Loading",
        isPartial: true,
      };

      return NextResponse.json({
        success: true,
        data: basicResult,
      });
    }

    // Strategy 5: Parallel AI analysis with timeout
    const aiAnalysisPromise = Promise.race([
      AIAnalyzer.analyze(ticker, metrics, score, stockData.price),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error("AI analysis timeout")), 15000)
      ),
    ]);

    let aiAnalysis;
    try {
      aiAnalysis = await aiAnalysisPromise;
    } catch (error) {
      console.warn(
        `⚠️ AI analysis failed/timeout for ${ticker}, using fallback`
      );
      aiAnalysis = generateFallbackAnalysis(ticker, metrics, score);
    }

    const result: AnalysisResult & {
      sources: typeof sources;
      processingTime: number;
      aiProvider: string;
    } = {
      ticker,
      stockData,
      metrics,
      score,
      aiAnalysis,
      timestamp: new Date(),
      sources,
      processingTime: Date.now() - startTime,
      aiProvider: process.env.GROQ_API_KEY ? "Groq Llama 3.1" : "Enhanced Mock",
    };

    console.log(
      `✅ Optimized analysis completed for ${ticker} - Score: ${score.overall.toFixed(
        0
      )}/100 - Time: ${result.processingTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    let errorTicker = "unknown";

    try {
      const { ticker } = await params;
      errorTicker = ticker;
    } catch {
      // If params can't be accessed, use "unknown"
    }

    console.error(
      `❌ Analysis error for ${errorTicker} (${processingTime}ms):`,
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid ticker format" },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Analysis failed";

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

function generateFallbackAnalysis(ticker: string, metrics: any, score: any) {
  return {
    summary: `${ticker} shows ${
      score.recommendation
    } signals with overall score of ${score.overall.toFixed(
      0
    )}/100. This is a fallback analysis.`,
    strengths: [
      score.breakdown.profitability > 60
        ? "Solid profitability metrics"
        : "Stable business operations",
      score.breakdown.financialHealth > 60
        ? "Strong balance sheet"
        : "Adequate financial position",
    ],
    weaknesses: [
      score.breakdown.valuation < 50
        ? "Premium valuation levels"
        : "Market volatility concerns",
    ],
    keyRisks: [
      "Market volatility",
      "Sector-specific risks",
      "Economic uncertainty",
    ],
    catalysts: [
      "Upcoming earnings report",
      "Industry developments",
      "Market expansion opportunities",
    ],
    recommendationReasoning: `Based on quantitative analysis, ${ticker} receives a ${
      score.recommendation
    } recommendation with ${score.overall.toFixed(
      0
    )}/100 overall score. Key metrics include profitability score of ${score.breakdown.profitability.toFixed(
      0
    )} and financial health score of ${score.breakdown.financialHealth.toFixed(
      0
    )}.`,
  };
}
