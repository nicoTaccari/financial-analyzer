import { NextResponse } from "next/server";
import { GroqAnalyzer } from "@/lib/ai/groq-analyzer";

export async function GET() {
  try {
    const groqHealth = await GroqAnalyzer.healthCheck();
    const usageStats = GroqAnalyzer.getUsageStats();

    return NextResponse.json({
      success: true,
      data: {
        provider: "Groq Only",
        groq: groqHealth,
        usage: usageStats,
        fallback: "Enhanced Mock Analysis",
        timestamp: new Date(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
}
