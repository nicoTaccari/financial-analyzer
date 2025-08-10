import type { FinancialMetrics, InvestmentScore } from "@/types";
import { CompositeScoreCalculator } from "./scoring/composite-score";

export class MetricsEngine {
  static calculateScore(metrics: FinancialMetrics): InvestmentScore {
    return CompositeScoreCalculator.calculate(metrics);
  }

  static calculateAll(metrics: FinancialMetrics) {
    const score = this.calculateScore(metrics);

    return {
      metrics,
      score,
      analysis: {
        strengths: this.identifyStrengths(metrics, score),
        weaknesses: this.identifyWeaknesses(metrics, score),
      },
    };
  }

  private static identifyStrengths(
    metrics: FinancialMetrics,
    score: InvestmentScore
  ): string[] {
    const strengths: string[] = [];

    if (score.breakdown.profitability > 75) {
      strengths.push(
        `Excelente rentabilidad con ROE de ${((metrics.roe || 0) * 100).toFixed(
          1
        )}%`
      );
    }

    if (score.breakdown.valuation > 75) {
      strengths.push(
        `Valoración atractiva con P/E de ${
          metrics.peRatio?.toFixed(1) || "N/A"
        }`
      );
    }

    if (score.breakdown.growth > 75) {
      strengths.push(
        `Fuerte crecimiento de ingresos del ${(
          (metrics.revenueGrowth || 0) * 100
        ).toFixed(1)}%`
      );
    }

    if (score.breakdown.financialHealth > 75) {
      strengths.push(
        `Balance sólido con ratio deuda/capital de ${
          metrics.debtToEquity?.toFixed(2) || "N/A"
        }`
      );
    }

    return strengths.length > 0 ? strengths : ["Empresa con métricas estables"];
  }

  private static identifyWeaknesses(
    metrics: FinancialMetrics,
    score: InvestmentScore
  ): string[] {
    const weaknesses: string[] = [];

    if (score.breakdown.profitability < 40) {
      weaknesses.push(
        `Rentabilidad baja con ROE de ${((metrics.roe || 0) * 100).toFixed(1)}%`
      );
    }

    if (score.breakdown.valuation < 40) {
      weaknesses.push(
        `Valoración elevada con P/E de ${metrics.peRatio?.toFixed(1) || "N/A"}`
      );
    }

    if (score.breakdown.growth < 40) {
      weaknesses.push(
        `Crecimiento limitado de ${((metrics.revenueGrowth || 0) * 100).toFixed(
          1
        )}%`
      );
    }

    if (score.breakdown.financialHealth < 40) {
      weaknesses.push(`Balance preocupante con alta deuda`);
    }

    return weaknesses.length > 0
      ? weaknesses
      : ["Sin debilidades significativas identificadas"];
  }
}
