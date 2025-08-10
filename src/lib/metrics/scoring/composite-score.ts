import type { FinancialMetrics, InvestmentScore } from "@/types";

export class CompositeScoreCalculator {
  private static readonly WEIGHTS = {
    valuation: 0.3,
    profitability: 0.3,
    growth: 0.25,
    financialHealth: 0.15,
  };

  static calculate(metrics: FinancialMetrics): InvestmentScore {
    const valuationScore = this.calculateValuationScore(metrics);
    const profitabilityScore = this.calculateProfitabilityScore(metrics);
    const growthScore = this.calculateGrowthScore(metrics);
    const financialHealthScore = this.calculateFinancialHealthScore(metrics);

    const breakdown = {
      valuation: valuationScore,
      profitability: profitabilityScore,
      growth: growthScore,
      financialHealth: financialHealthScore,
    };

    const overall = this.calculateWeightedScore(breakdown);
    const recommendation = this.getRecommendation(overall);
    const confidence = this.calculateConfidence(metrics);
    const riskLevel = this.assessRiskLevel(breakdown);

    return {
      overall,
      recommendation,
      confidence,
      breakdown,
      riskLevel,
    };
  }

  private static calculateValuationScore(metrics: FinancialMetrics): number {
    const scores: number[] = [];

    // P/E Ratio scoring
    if (metrics.peRatio !== null) {
      if (metrics.peRatio < 15) scores.push(90);
      else if (metrics.peRatio < 25) scores.push(75);
      else if (metrics.peRatio < 35) scores.push(50);
      else scores.push(25);
    }

    // P/B Ratio scoring
    if (metrics.priceToBook !== null) {
      if (metrics.priceToBook < 1.5) scores.push(85);
      else if (metrics.priceToBook < 3) scores.push(65);
      else if (metrics.priceToBook < 5) scores.push(45);
      else scores.push(25);
    }

    // EV/EBITDA scoring
    if (metrics.evToEbitda !== null) {
      if (metrics.evToEbitda < 10) scores.push(85);
      else if (metrics.evToEbitda < 15) scores.push(70);
      else if (metrics.evToEbitda < 20) scores.push(55);
      else scores.push(30);
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 50;
  }

  private static calculateProfitabilityScore(
    metrics: FinancialMetrics
  ): number {
    const scores: number[] = [];

    // ROE scoring
    if (metrics.roe !== null) {
      if (metrics.roe > 0.15) scores.push(90);
      else if (metrics.roe > 0.1) scores.push(75);
      else if (metrics.roe > 0.05) scores.push(55);
      else scores.push(30);
    }

    // Net Margin scoring
    if (metrics.netMargin !== null) {
      if (metrics.netMargin > 0.15) scores.push(85);
      else if (metrics.netMargin > 0.08) scores.push(70);
      else if (metrics.netMargin > 0.03) scores.push(55);
      else scores.push(30);
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 50;
  }

  private static calculateGrowthScore(metrics: FinancialMetrics): number {
    const scores: number[] = [];

    // Revenue Growth scoring
    if (metrics.revenueGrowth !== null) {
      if (metrics.revenueGrowth > 0.2) scores.push(90);
      else if (metrics.revenueGrowth > 0.1) scores.push(75);
      else if (metrics.revenueGrowth > 0) scores.push(60);
      else scores.push(25);
    }

    // Earnings Growth scoring
    if (metrics.earningsGrowth !== null) {
      if (metrics.earningsGrowth > 0.25) scores.push(90);
      else if (metrics.earningsGrowth > 0.1) scores.push(75);
      else if (metrics.earningsGrowth > 0) scores.push(60);
      else scores.push(25);
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 50;
  }

  private static calculateFinancialHealthScore(
    metrics: FinancialMetrics
  ): number {
    const scores: number[] = [];

    // Debt/Equity scoring (lower is better)
    if (metrics.debtToEquity !== null) {
      if (metrics.debtToEquity < 0.3) scores.push(90);
      else if (metrics.debtToEquity < 0.6) scores.push(75);
      else if (metrics.debtToEquity < 1.0) scores.push(55);
      else scores.push(30);
    }

    // Current Ratio scoring
    if (metrics.currentRatio !== null) {
      if (metrics.currentRatio > 2.0) scores.push(85);
      else if (metrics.currentRatio > 1.5) scores.push(75);
      else if (metrics.currentRatio > 1.0) scores.push(60);
      else scores.push(30);
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 50;
  }

  private static calculateWeightedScore(
    breakdown: InvestmentScore["breakdown"]
  ): number {
    return (
      breakdown.valuation * this.WEIGHTS.valuation +
      breakdown.profitability * this.WEIGHTS.profitability +
      breakdown.growth * this.WEIGHTS.growth +
      breakdown.financialHealth * this.WEIGHTS.financialHealth
    );
  }

  private static getRecommendation(score: number): "BUY" | "HOLD" | "SELL" {
    if (score >= 75) return "BUY";
    if (score >= 50) return "HOLD";
    return "SELL";
  }

  private static calculateConfidence(metrics: FinancialMetrics): number {
    const availableMetrics = Object.values(metrics).filter(
      (m) => m !== null
    ).length;
    const totalMetrics = Object.keys(metrics).length;
    return Math.round((availableMetrics / totalMetrics) * 100);
  }

  private static assessRiskLevel(
    breakdown: InvestmentScore["breakdown"]
  ): "LOW" | "MEDIUM" | "HIGH" {
    const financialHealthScore = breakdown.financialHealth;
    const valuationScore = breakdown.valuation;

    if (financialHealthScore > 75 && valuationScore > 65) return "LOW";
    if (financialHealthScore > 55 && valuationScore > 45) return "MEDIUM";
    return "HIGH";
  }
}
