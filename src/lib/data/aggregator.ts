import { unstable_cache } from "next/cache";
import { AlphaVantageProvider } from "./providers/alpha-vantage";
import { MockFinancialProvider } from "./providers/mock-provider";
import type { StockData, FinancialMetrics } from "@/types";

// Providers en orden de preferencia
const stockProviders = [
  new AlphaVantageProvider(),
  new MockFinancialProvider(), // Fallback final
];

const metricsProviders = [
  new AlphaVantageProvider(),
  new MockFinancialProvider(), // Yahoo no tiene métricas completas
];

// Cache con Next.js
export const getCachedStockData = unstable_cache(
  async (ticker: string): Promise<{ data: StockData; source: string }> => {
    console.log(`🔍 Fetching fresh stock data for ${ticker}`);

    const errors: string[] = [];

    for (const provider of stockProviders) {
      try {
        const data = await provider.getStockData(ticker);

        if (validateStockData(data)) {
          console.log(`✅ Success with ${provider.name} for ${ticker}`);
          return { data, source: provider.name };
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(`❌ ${provider.name} failed for ${ticker}: ${errorMsg}`);
        errors.push(`${provider.name}: ${errorMsg}`);

        // Si es rate limit, esperar un poco antes del siguiente provider
        if (
          errorMsg.includes("rate limit") ||
          errorMsg.includes("API call frequency")
        ) {
          console.log(`⏳ Rate limit detected, waiting 2 seconds...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    throw new Error(
      `All providers failed for ${ticker}. Errors: ${errors.join("; ")}`
    );
  },
  ["stock-data"],
  {
    revalidate: 300, // 5 minutos
    tags: ["stocks"],
  }
);

export const getCachedFinancialMetrics = unstable_cache(
  async (
    ticker: string
  ): Promise<{ data: FinancialMetrics; source: string }> => {
    console.log(`📊 Fetching fresh metrics for ${ticker}`);

    const errors: string[] = [];

    for (const provider of metricsProviders) {
      try {
        const data = await provider.getFinancialMetrics(ticker);

        if (validateFinancialMetrics(data)) {
          console.log(`✅ Metrics success with ${provider.name} for ${ticker}`);
          return { data, source: provider.name };
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.warn(
          `❌ ${provider.name} metrics failed for ${ticker}: ${errorMsg}`
        );
        errors.push(`${provider.name}: ${errorMsg}`);

        if (errorMsg.includes("rate limit")) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    throw new Error(
      `All metrics providers failed for ${ticker}. Errors: ${errors.join("; ")}`
    );
  },
  ["financial-metrics"],
  {
    revalidate: 600, // 10 minutos
    tags: ["metrics"],
  }
);

export class FinancialDataAggregator {
  static async getStockData(ticker: string): Promise<StockData> {
    const result = await getCachedStockData(ticker.toUpperCase());
    return result.data;
  }

  static async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    const result = await getCachedFinancialMetrics(ticker.toUpperCase());
    return result.data;
  }

  static async getDataWithSources(ticker: string) {
    const [stockResult, metricsResult] = await Promise.all([
      getCachedStockData(ticker.toUpperCase()),
      getCachedFinancialMetrics(ticker.toUpperCase()),
    ]);

    return {
      stockData: stockResult.data,
      metrics: metricsResult.data,
      sources: {
        stockData: stockResult.source,
        metrics: metricsResult.source,
      },
    };
  }
}

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
  // Al menos 3 métricas deben tener valores válidos
  const validMetrics = Object.values(data).filter(
    (value) => value !== null && value !== undefined && !isNaN(value as number)
  ).length;

  return validMetrics >= 3;
}
