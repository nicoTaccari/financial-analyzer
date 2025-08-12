import type { StockData, FinancialMetrics } from "@/types";
import type { HistoricalData, HistoricalDataPoint } from "@/types";

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

  async getHistoricalData(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ): Promise<HistoricalData> {
    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    console.log(
      `✅ Mock historical data generated for ${ticker} (${timeframe})`
    );

    return this.generateMockHistoricalData(ticker, timeframe);
  }

  private generateMockHistoricalData(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ): HistoricalData {
    const days = this.getTimeframeDays(timeframe);
    const basePrice = 100 + (ticker.charCodeAt(0) - 65) * 10; // Consistent with stock data
    const data: HistoricalDataPoint[] = [];

    // Generate data points going backwards from today
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends for more realistic data
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Generate realistic price movement
      const daysSinceStart = days - i;
      const trendFactor = Math.sin((daysSinceStart / days) * Math.PI * 2) * 0.3; // Long-term trend
      const randomFactor = (Math.random() - 0.5) * 0.1; // Daily volatility
      const overallTrend =
        timeframe === "5Y" ? 0.5 : timeframe === "2Y" ? 0.3 : 0.1; // Long-term growth

      const priceMultiplier =
        1 + (daysSinceStart / days) * overallTrend + trendFactor + randomFactor;
      const currentPrice = basePrice * priceMultiplier;

      // Generate OHLC data
      const dailyVolatility = 0.03; // 3% daily volatility
      const open =
        i === days - 1
          ? currentPrice
          : data[data.length - 1]?.close || currentPrice;
      const volatilityRange = open * dailyVolatility;

      const high = open + Math.random() * volatilityRange;
      const low = open - Math.random() * volatilityRange;
      const close = low + Math.random() * (high - low);

      // Generate volume (more volume on big moves)
      const priceChange = Math.abs((close - open) / open);
      const baseVolume = 1000000 + (ticker.charCodeAt(0) - 65) * 100000;
      const volume = Math.floor(
        baseVolume * (1 + priceChange * 5) * (0.7 + Math.random() * 0.6)
      );

      data.push({
        date: date.toISOString().split("T")[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
      });
    }

    return {
      symbol: ticker,
      timeframe,
      data,
      lastUpdated: new Date(),
    };
  }

  private getTimeframeDays(
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ): number {
    switch (timeframe) {
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      case "2Y":
        return 730;
      case "5Y":
        return 1825;
      default:
        return 365;
    }
  }
}
