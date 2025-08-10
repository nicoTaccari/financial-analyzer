import Groq from "groq-sdk";
import type { FinancialMetrics, InvestmentScore, AIAnalysis } from "@/types";

console.log("🔧 GroqAnalyzer module loaded"); // DEBUG

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export class GroqAnalyzer {
  static async analyze(
    ticker: string,
    metrics: FinancialMetrics,
    score: InvestmentScore,
    stockPrice?: number
  ): Promise<AIAnalysis> {
    console.log("🚀 GroqAnalyzer.analyze called for:", ticker); // DEBUG

    console.log(process.env.GROQ_API_KEY);
    if (!process.env.GROQ_API_KEY) {
      console.log("❌ No GROQ_API_KEY found"); // DEBUG
      throw new Error("Groq API key not configured");
    }

    console.log("🚀 Groq compound betq: Analyzing", ticker); // MAIN LOG

    const prompt = this.buildPrompt(ticker, metrics, score, stockPrice);

    try {
      console.log("📤 Sending request to Groq..."); // DEBUG

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "compound-beta",
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null,
      });

      console.log("📥 Received response from Groq"); // DEBUG

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        console.log("❌ Empty response from Groq"); // DEBUG
        throw new Error("Empty response from Groq");
      }

      console.log("🔍 Parsing Groq response..."); // DEBUG

      try {
        const parsed = JSON.parse(response) as AIAnalysis;

        if (!parsed.summary || !parsed.strengths || !parsed.weaknesses) {
          console.log("❌ Invalid response structure from Groq"); // DEBUG
          throw new Error("Invalid response structure from Groq");
        }

        console.log("✅ Groq analysis completed for", ticker); // MAIN LOG
        return parsed;
      } catch (parseError) {
        console.error("❌ Failed to parse Groq response:", parseError);
        console.log("Raw response:", response.substring(0, 200) + "...");

        // Intentar extraer JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]) as AIAnalysis;
            console.log(
              "✅ Groq analysis completed (extracted JSON) for",
              ticker
            );
            return parsed;
          } catch (e) {
            throw parseError;
          }
        }

        throw parseError;
      }
    } catch (error) {
      console.error("❌ Groq API error for", ticker, ":", error);
      throw error;
    }
  }

  private static getSystemPrompt(): string {
    return `Eres un analista financiero senior con 15 años de experiencia en Wall Street.

Responde SIEMPRE en formato JSON válido exacto sin texto adicional.`;
  }

  private static buildPrompt(
    ticker: string,
    metrics: FinancialMetrics,
    score: InvestmentScore,
    stockPrice?: number
  ): string {
    const metricsText = Object.entries(metrics)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => {
        if (
          key.includes("Margin") ||
          key.includes("Growth") ||
          key === "roe" ||
          key === "roa"
        ) {
          return `${key}: ${((value as number) * 100).toFixed(1)}%`;
        }
        return `${key}: ${(value as number).toFixed(2)}`;
      })
      .join("\n");

    return `Analiza ${ticker}:

PRECIO: ${stockPrice ? `$${stockPrice.toFixed(2)}` : "N/A"}

MÉTRICAS:
${metricsText}

SCORE: ${score.overall}/100 (${score.recommendation})

Responde en este JSON exacto:
{
  "summary": "Resumen de 2 oraciones con números específicos",
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "weaknesses": ["debilidad 1", "debilidad 2"],
  "keyRisks": ["riesgo 1", "riesgo 2", "riesgo 3"],
  "catalysts": ["catalizador 1", "catalizador 2"],
  "recommendationReasoning": "Explicación de 3-4 oraciones citando métricas específicas"
}`;
  }
}
