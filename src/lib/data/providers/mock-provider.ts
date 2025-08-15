// src/lib/data/providers/mock-provider-optimized.ts
import type { StockData, FinancialMetrics } from "@/types";
import type { HistoricalData, HistoricalDataPoint } from "@/types";

export class MockFinancialProvider {
  name = "Optimized Mock Provider";

  async getStockData(ticker: string): Promise<StockData> {
    // Reduced delay from 1000ms to 200ms
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockData = this.getMockData(ticker);
    console.log(`✅ Fast mock data fetched for ${ticker}`);

    return mockData;
  }

  async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    // Reduced delay from 800ms to 150ms
    await new Promise((resolve) => setTimeout(resolve, 150));

    return this.getMockMetrics(ticker);
  }

  async getHistoricalData(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ): Promise<HistoricalData> {
    // Reduced delay from 1200ms to 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log(
      `✅ Fast mock historical data generated for ${ticker} (${timeframe})`
    );

    return this.generateMockHistoricalData(ticker, timeframe);
  }

  // Pre-computed mock data for faster response
  private static precomputedData = new Map<string, StockData>();
  private static precomputedMetrics = new Map<string, FinancialMetrics>();

  private getMockData(ticker: string): StockData {
    // Check precomputed cache
    if (MockFinancialProvider.precomputedData.has(ticker)) {
      const cached = MockFinancialProvider.precomputedData.get(ticker)!;
      // Add some variance to price for realism
      const variance = (Math.random() - 0.5) * 2;
      return {
        ...cached,
        price: cached.price + variance,
        change: variance,
        changePercent: (variance / cached.price) * 100,
      };
    }

    const basePrice = 100 + (ticker.charCodeAt(0) - 65) * 10;
    const change = (Math.random() - 0.5) * 10;

    const data: StockData = {
      symbol: ticker,
      companyName: this.getCompanyName(ticker),
      price: basePrice + change,
      change: change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap:
        (basePrice + change) * (Math.random() * 1000000000 + 100000000),
    };

    // Cache for future use
    MockFinancialProvider.precomputedData.set(ticker, data);
    return data;
  }

  private getMockMetrics(ticker: string): FinancialMetrics {
    // Check precomputed cache
    if (MockFinancialProvider.precomputedMetrics.has(ticker)) {
      return MockFinancialProvider.precomputedMetrics.get(ticker)!;
    }

    // Use deterministic values based on ticker for consistency
    const seed = ticker
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const deterministicRandom = (min: number, max: number, salt = 0) => {
      const value = ((seed + salt) * 9301 + 49297) % 233280;
      return min + (value / 233280) * (max - min);
    };

    const metrics: FinancialMetrics = {
      // Valuation
      peRatio: deterministicRandom(10, 40, 1),
      priceToBook: deterministicRandom(0.5, 5, 2),
      priceToSales: deterministicRandom(1, 10, 3),
      evToEbitda: deterministicRandom(8, 25, 4),

      // Profitability
      roe: deterministicRandom(0.05, 0.25, 5),
      roa: deterministicRandom(0.02, 0.15, 6),
      grossMargin: deterministicRandom(0.2, 0.7, 7),
      netMargin: deterministicRandom(0.05, 0.3, 8),

      // Financial Health
      debtToEquity: deterministicRandom(0.1, 2.0, 9),
      currentRatio: deterministicRandom(0.8, 3.0, 10),

      // Growth
      revenueGrowth: deterministicRandom(-0.1, 0.5, 11),
      earningsGrowth: deterministicRandom(-0.2, 0.8, 12),
    };

    // Cache for future use
    MockFinancialProvider.precomputedMetrics.set(ticker, metrics);
    return metrics;
  }

  private generateMockHistoricalData(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ): HistoricalData {
    // Reduce data points for faster generation
    const days = this.getOptimizedTimeframeDays(timeframe);
    const basePrice = 100 + (ticker.charCodeAt(0) - 65) * 10;
    const data: HistoricalDataPoint[] = [];

    const today = new Date();
    const seed = ticker
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate fewer points but more efficiently
    const stepSize = Math.max(1, Math.floor(days / 100)); // Max 100 points

    for (let i = days - 1; i >= 0; i -= stepSize) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Simplified price calculation
      const daysSinceStart = days - i;
      const trendFactor =
        Math.sin((daysSinceStart / days) * Math.PI * 2 + seed) * 0.2;
      const randomFactor = ((seed + i) % 100) / 1000 - 0.05;

      const priceMultiplier = 1 + trendFactor + randomFactor;
      const currentPrice = basePrice * priceMultiplier;

      // Simplified OHLC generation
      const volatility = currentPrice * 0.02;
      const open = currentPrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);

      // Simplified volume
      const baseVolume = 1000000 + (seed % 100) * 10000;
      const volume = Math.floor(baseVolume * (0.8 + Math.random() * 0.4));

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
      data: data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      lastUpdated: new Date(),
    };
  }

  private getOptimizedTimeframeDays(
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  ): number {
    // Reduced number of days for faster processing
    switch (timeframe) {
      case "1M":
        return 22; // Trading days in a month
      case "3M":
        return 65;
      case "6M":
        return 130;
      case "1Y":
        return 250; // Trading days in a year
      case "2Y":
        return 500;
      case "5Y":
        return 1250;
      default:
        return 250;
    }
  }

  private getCompanyName(ticker: string): string {
    const companyNames: Record<string, string> = {
      AAPL: "Apple Inc.",
      MSFT: "Microsoft Corporation",
      GOOGL: "Alphabet Inc.",
      AMZN: "Amazon.com Inc.",
      TSLA: "Tesla Inc.",
      NVDA: "NVIDIA Corporation",
      META: "Meta Platforms Inc.",
      NFLX: "Netflix Inc.",
      AMD: "Advanced Micro Devices Inc.",
      INTC: "Intel Corporation",
    };

    return companyNames[ticker] || `${ticker} Corporation`;
  }

  // Batch processing for multiple tickers
  async getBatchStockData(
    tickers: string[]
  ): Promise<Record<string, StockData>> {
    // Process in parallel with minimal delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const results: Record<string, StockData> = {};
    for (const ticker of tickers) {
      results[ticker] = this.getMockData(ticker);
    }

    return results;
  }

  // Warm up cache for popular stocks
  static warmUpCache(
    popularTickers: string[] = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]
  ) {
    const provider = new MockFinancialProvider();

    popularTickers.forEach((ticker) => {
      provider.getMockData(ticker);
      provider.getMockMetrics(ticker);
    });

    console.log(
      `🔥 Warmed up cache for ${popularTickers.length} popular stocks`
    );
  }
}
