// Core Types
export interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface FinancialMetrics {
  // Valuation
  peRatio: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  evToEbitda: number | null;

  // Profitability
  roe: number | null;
  roa: number | null;
  grossMargin: number | null;
  netMargin: number | null;

  // Financial Health
  debtToEquity: number | null;
  currentRatio: number | null;

  // Growth
  revenueGrowth: number | null;
  earningsGrowth: number | null;
}

export interface InvestmentScore {
  overall: number;
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  breakdown: {
    valuation: number;
    profitability: number;
    growth: number;
    financialHealth: number;
  };
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keyRisks: string[];
  catalysts: string[];
  recommendationReasoning: string;
}

export interface AnalysisResult {
  ticker: string;
  stockData: StockData;
  metrics: FinancialMetrics;
  score: InvestmentScore;
  aiAnalysis: AIAnalysis;
  timestamp: Date;
}
