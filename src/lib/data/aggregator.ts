// src/lib/data/aggregator-optimized.ts
import { unstable_cache } from "next/cache";
import { AlphaVantageProvider } from "./providers/alpha-vantage";
import { MockFinancialProvider } from "./providers/mock-provider";
import type { StockData, FinancialMetrics } from "@/types";
import type { HistoricalData } from "@/types";

// Optimized providers with reduced delays
const stockProviders = [
  new AlphaVantageProvider(),
  new MockFinancialProvider(),
];

// In-memory cache for very recent requests (last 60 seconds)
const memoryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

function setMemoryCache(key: string, data: any, ttlMs = 60000) {
  memoryCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

function getMemoryCache(key: string) {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
}

// Optimized cache with shorter revalidation for faster responses
export const getCachedStockData = unstable_cache(
  async (ticker: string): Promise<{ data: StockData; source: string }> => {
    // Check memory cache first
    const cacheKey = `stock-${ticker}`;
    const cached = getMemoryCache(cacheKey);
    if (cached) {
      console.log(`💾 Memory cache hit for ${ticker} stock data`);
      return cached;
    }

    console.log(`🔍 Fetching fresh stock data for ${ticker}`);
    const errors: string[] = [];

    for (const provider of stockProviders) {
      try {
        const data = await provider.getStockData(ticker);

        if (validateStockData(data)) {
          console.log(`✅ Success with ${provider.name} for ${ticker}`);
          const result = { data, source: provider.name };
          setMemoryCache(cacheKey, result, 60000); // 1 minute memory cache
          return result;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(`❌ ${provider.name} failed for ${ticker}: ${errorMsg}`);
        errors.push(`${provider.name}: ${errorMsg}`);

        // Reduced wait time for rate limits
        if (errorMsg.includes("rate limit")) {
          console.log(`⏳ Rate limit detected, waiting 1 second...`);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Reduced from 2000ms
        }
      }
    }

    throw new Error(
      `All providers failed for ${ticker}. Errors: ${errors.join("; ")}`
    );
  },
  ["stock-data-optimized"],
  {
    revalidate: 120, // Reduced from 300 to 2 minutes
    tags: ["stocks"],
  }
);

export const getCachedFinancialMetrics = unstable_cache(
  async (
    ticker: string
  ): Promise<{ data: FinancialMetrics; source: string }> => {
    // Check memory cache first
    const cacheKey = `metrics-${ticker}`;
    const cached = getMemoryCache(cacheKey);
    if (cached) {
      console.log(`💾 Memory cache hit for ${ticker} metrics`);
      return cached;
    }

    console.log(`📊 Fetching fresh metrics for ${ticker}`);
    const errors: string[] = [];

    for (const provider of stockProviders) {
      try {
        const data = await provider.getFinancialMetrics(ticker);

        if (validateFinancialMetrics(data)) {
          console.log(`✅ Metrics success with ${provider.name} for ${ticker}`);
          const result = { data, source: provider.name };
          setMemoryCache(cacheKey, result, 300000); // 5 minute memory cache for metrics
          return result;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(
          `❌ ${provider.name} metrics failed for ${ticker}: ${errorMsg}`
        );
        errors.push(`${provider.name}: ${errorMsg}`);

        // Reduced wait time
        if (errorMsg.includes("rate limit")) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(
      `All metrics providers failed for ${ticker}. Errors: ${errors.join("; ")}`
    );
  },
  ["financial-metrics-optimized"],
  {
    revalidate: 300, // Reduced from 600 to 5 minutes
    tags: ["metrics"],
  }
);

export const getCachedHistoricalData = unstable_cache(
  async (
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ): Promise<{ data: HistoricalData; source: string }> => {
    const cacheKey = `historical-${ticker}-${timeframe}`;
    const cached = getMemoryCache(cacheKey);
    if (cached) {
      console.log(`💾 Memory cache hit for ${ticker} historical data`);
      return cached;
    }

    console.log(
      `📈 Fetching fresh historical data for ${ticker} (${timeframe})`
    );
    const errors: string[] = [];

    for (const provider of stockProviders) {
      if (provider.name !== "Alpha Vantage") continue;

      try {
        if ("getHistoricalData" in provider) {
          const data = await (provider as any).getHistoricalData(
            ticker,
            timeframe
          );

          if (validateHistoricalData(data)) {
            console.log(
              `✅ Historical data success with ${provider.name} for ${ticker}`
            );
            const result = { data, source: provider.name };
            setMemoryCache(cacheKey, result, 600000); // 10 minute memory cache
            return result;
          }
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(
          `❌ ${provider.name} historical failed for ${ticker}: ${errorMsg}`
        );
        errors.push(`${provider.name}: ${errorMsg}`);

        if (errorMsg.includes("rate limit")) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // Fallback to mock with reduced delay
    try {
      const mockProvider = new MockFinancialProvider();
      const data = await (mockProvider as any).getHistoricalData(
        ticker,
        timeframe
      );
      console.log(`✅ Using mock historical data for ${ticker}`);
      const result = { data, source: "Mock Provider" };
      setMemoryCache(cacheKey, result, 300000); // 5 minute cache for mock data
      return result;
    } catch (error) {
      throw new Error(
        `All historical data providers failed for ${ticker}. Errors: ${errors.join(
          "; "
        )}`
      );
    }
  },
  ["historical-data-optimized"],
  {
    revalidate: 900, // Reduced from 1800 to 15 minutes
    tags: ["historical"],
  }
);

export class FinancialDataAggregator {
  // Fast method that returns data as soon as available
  static async getDataWithSources(ticker: string) {
    const tickerUpper = ticker.toUpperCase();

    console.log(`🚀 Starting parallel data fetch for ${tickerUpper}`);

    // Execute in parallel with timeout
    const dataPromises = Promise.allSettled([
      Promise.race([
        getCachedStockData(tickerUpper),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Stock data timeout")), 8000)
        ),
      ]),
      Promise.race([
        getCachedFinancialMetrics(tickerUpper),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Metrics timeout")), 10000)
        ),
      ]),
    ]);

    const [stockResult, metricsResult] = await dataPromises;

    // Handle stock data
    let stockData, stockSource;
    if (stockResult.status === "fulfilled") {
      stockData = stockResult.value.data;
      stockSource = stockResult.value.source;
    } else {
      console.warn(`⚠️ Stock data failed, using mock for ${tickerUpper}`);
      const mockProvider = new MockFinancialProvider();
      stockData = await mockProvider.getStockData(tickerUpper);
      stockSource = "Mock Provider (Fallback)";
    }

    // Handle metrics data
    let metrics, metricsSource;
    if (metricsResult.status === "fulfilled") {
      metrics = metricsResult.value.data;
      metricsSource = metricsResult.value.source;
    } else {
      console.warn(`⚠️ Metrics failed, using mock for ${tickerUpper}`);
      const mockProvider = new MockFinancialProvider();
      metrics = await mockProvider.getFinancialMetrics(tickerUpper);
      metricsSource = "Mock Provider (Fallback)";
    }

    return {
      stockData,
      metrics,
      sources: {
        stockData: stockSource,
        metrics: metricsSource,
      },
    };
  }

  // Background prefetch for popular stocks
  static async prefetchPopularStocks(tickers: string[]) {
    console.log(`🔄 Background prefetching for: ${tickers.join(", ")}`);

    // Don't await, just start the prefetch
    tickers.forEach(async (ticker) => {
      try {
        await this.getDataWithSources(ticker);
      } catch (error) {
        console.log(`Background prefetch failed for ${ticker}:`, error);
      }
    });
  }

  // Batch method for multiple tickers
  static async getBatchData(tickers: string[]) {
    const results = await Promise.allSettled(
      tickers.map((ticker) => this.getDataWithSources(ticker))
    );

    return results.reduce((acc, result, index) => {
      const ticker = tickers[index];
      if (result.status === "fulfilled") {
        acc[ticker] = result.value;
      } else {
        console.warn(`Batch fetch failed for ${ticker}:`, result.reason);
      }
      return acc;
    }, {} as Record<string, any>);
  }

  // Legacy methods for compatibility
  static async getHistoricalDataWithSource(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ) {
    return await getCachedHistoricalData(ticker.toUpperCase(), timeframe);
  }
}

// Validation functions (same as before)
function validateStockData(data: StockData): boolean {
  return (
    data.symbol !== undefined &&
    data.price > 0 &&
    !isNaN(data.price) &&
    data.companyName !== undefined &&
    data.companyName.length > 0
  );
}

function validateFinancialMetrics(data: FinancialMetrics): boolean {
  const validMetrics = Object.values(data).filter(
    (value) => value !== null && value !== undefined && !isNaN(value as number)
  ).length;
  return validMetrics >= 3;
}

function validateHistoricalData(data: HistoricalData): boolean {
  return (
    data.symbol !== undefined &&
    data.data.length > 0 &&
    data.data.every(
      (point) =>
        point.date !== undefined &&
        point.close > 0 &&
        !isNaN(point.close) &&
        point.volume >= 0
    )
  );
}
