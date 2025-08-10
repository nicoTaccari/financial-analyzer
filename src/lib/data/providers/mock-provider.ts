import type { StockData, FinancialMetrics } from "@/types";

// Mock provider para empezar sin APIs
export class MockFinancialProvider {
  name = "Mock Provider";

  async getStockData(ticker: string): Promise<StockData> {
    // Simular delay de API real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData = this.getMockData(ticker);
    console.log(`✅ Mock data fetched for ${ticker}`);

    return mockData;
  }

  async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return this.getMockMetrics(ticker);
  }

  private getMockData(ticker: string): StockData {
    const basePrice = 100 + (ticker.charCodeAt(0) - 65) * 10; // A=100, B=110, etc
    const change = (Math.random() - 0.5) * 10;

    return {
      symbol: ticker,
      companyName: `${ticker} Corporation`,
      price: basePrice + change,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap:
        (basePrice + change) * (Math.random() * 1000000000 + 100000000),
    };
  }

  private getMockMetrics(ticker: string): FinancialMetrics {
    // Generar métricas basadas en ticker para consistencia
    const seed = ticker.charCodeAt(0) - 65;
    const rand = (min: number, max: number) =>
      min + ((seed * 7 + Math.random()) % 1) * (max - min);

    return {
      // Valuation
      peRatio: rand(10, 40),
      priceToBook: rand(0.5, 5),
      priceToSales: rand(1, 10),
      evToEbitda: rand(8, 25),

      // Profitability
      roe: rand(0.05, 0.25),
      roa: rand(0.02, 0.15),
      grossMargin: rand(0.2, 0.7),
      netMargin: rand(0.05, 0.3),

      // Financial Health
      debtToEquity: rand(0.1, 2.0),
      currentRatio: rand(0.8, 3.0),

      // Growth
      revenueGrowth: rand(-0.1, 0.5),
      earningsGrowth: rand(-0.2, 0.8),
    };
  }
}
