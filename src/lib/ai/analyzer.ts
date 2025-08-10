import { GroqAnalyzer } from "./groq-analyzer";
import type { FinancialMetrics, InvestmentScore, AIAnalysis } from "@/types";

console.log("🔧 AIAnalyzer module loaded"); // DEBUG

export class AIAnalyzer {
  static async analyze(
    ticker: string,
    metrics: FinancialMetrics,
    score: InvestmentScore,
    stockPrice?: number
  ): Promise<AIAnalysis> {
    console.log("🎯 AIAnalyzer.analyze called for:", ticker); // DEBUG

    // SOLO GROQ → MOCK (arquitectura simplificada)

    if (process.env.GROQ_API_KEY) {
      try {
        console.log("🚀 Using Groq for", ticker, "analysis"); // DEBUG
        return await GroqAnalyzer.analyze(ticker, metrics, score, stockPrice);
      } catch (error) {
        console.error("❌ Groq error, falling back to mock:", error);
        return await this.mockAnalyze(ticker, metrics, score);
      }
    }

    console.log("🤖 Using Mock for", ticker, "analysis (no Groq key)"); // DEBUG
    return await this.mockAnalyze(ticker, metrics, score);
  }

  private static async mockAnalyze(
    ticker: string,
    metrics: FinancialMetrics,
    score: InvestmentScore
  ): Promise<AIAnalysis> {
    console.log("🎭 Mock analysis starting for", ticker); // DEBUG

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const result = {
      summary: `${ticker} presenta métricas que indican ${score.recommendation} con score de ${score.overall}/100`,
      strengths: ["Análisis mock básico", "Datos disponibles"],
      weaknesses: ["Sin análisis IA real"],
      keyRisks: ["Volatilidad de mercado", "Riesgos sectoriales"],
      catalysts: ["Próximos earnings", "Desarrollos del sector"],
      recommendationReasoning: `Mock analysis sugiere ${score.recommendation} basado en score de ${score.overall}/100`,
    };

    console.log("🎭 Mock analysis completed for", ticker); // DEBUG
    return result;
  }
}
