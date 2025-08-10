import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FinancialDataAggregator } from "@/lib/data/aggregator";
import { MetricsEngine } from "@/lib/metrics";
import { AIAnalyzer } from "@/lib/ai/analyzer";
import type { AnalysisResult } from "@/types";

const tickerSchema = z.string().regex(/^[A-Z]{1,5}$/, "Invalid ticker format");

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const startTime = Date.now();

  try {
    // Validar ticker
    const ticker = tickerSchema.parse(params.ticker.toUpperCase());

    console.log(`🔍 Starting analysis for ${ticker}`);

    // 1. Obtener datos con sources info
    const { stockData, metrics, sources } =
      await FinancialDataAggregator.getDataWithSources(ticker);

    console.log(
      `📊 Data sources - Stock: ${sources.stockData}, Metrics: ${sources.metrics}`
    );

    // 2. Calcular score
    const { score } = MetricsEngine.calculateAll(metrics);

    // 3. Generar análisis IA
    debugger;
    const aiAnalysis = await AIAnalyzer.analyze(
      ticker,
      metrics,
      score,
      stockData.price
    );

    // 4. Construir resultado
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
      aiProvider: process.env.GROQ_API_KEY ? "Groq Llama 3.1" : "Enhanced Mock", // ← AGREGAR
    };

    console.log(
      `✅ Analysis completed for ${ticker} - Score: ${score.overall.toFixed(
        0
      )}/100 - Time: ${result.processingTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Analysis error for ${params.ticker} (${processingTime}ms):`,
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
