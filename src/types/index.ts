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

// Historical Data Types
export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y";
  data: HistoricalDataPoint[];
  lastUpdated: Date;
}

export interface TechnicalIndicators {
  sma20: number | null;
  sma50: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi: number | null;
}

export interface ChartDataPoint extends HistoricalDataPoint {
  indicators?: TechnicalIndicators;
  change?: number;
  changePercent?: number;
}
