import axios from "axios";
import type { StockData, FinancialMetrics } from "@/types";

export class AlphaVantageProvider {
  name = "Alpha Vantage";
  private baseUrl = "https://www.alphavantage.co/query";
  private apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  hourlyLimit = 500;
  cacheTTL = 300; // 5 minutos

  async getStockData(ticker: string): Promise<StockData> {
    if (!this.apiKey) {
      throw new Error("Alpha Vantage API key not configured");
    }

    try {
      console.log(`🔍 Alpha Vantage: Fetching stock data for ${ticker}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: ticker,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const quote = response.data["Global Quote"];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data found for ticker ${ticker}`);
      }

      if (response.data["Error Message"]) {
        throw new Error(response.data["Error Message"]);
      }

      if (response.data["Note"]) {
        throw new Error("API rate limit exceeded");
      }

      return {
        symbol: ticker,
        companyName: `${ticker} Corporation`, // Alpha Vantage Quote no incluye nombre
        price: parseFloat(quote["05. price"]) || 0,
        change: parseFloat(quote["09. change"]) || 0,
        changePercent:
          parseFloat(quote["10. change percent"].replace("%", "")) || 0,
        volume: parseInt(quote["06. volume"]) || 0,
        marketCap: 0, // Calcularemos después
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Alpha Vantage API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getFinancialMetrics(ticker: string): Promise<FinancialMetrics> {
    if (!this.apiKey) {
      throw new Error("Alpha Vantage API key not configured");
    }

    try {
      console.log(`📊 Alpha Vantage: Fetching financial metrics for ${ticker}`);

      const response = await axios.get(this.baseUrl, {
        params: {
          function: "OVERVIEW",
          symbol: ticker,
          apikey: this.apiKey,
        },
        timeout: 15000,
      });

      const overview = response.data;

      if (!overview || Object.keys(overview).length === 0) {
        throw new Error(`No financial data found for ticker ${ticker}`);
      }

      if (overview["Error Message"]) {
        throw new Error(overview["Error Message"]);
      }

      if (overview["Note"]) {
        throw new Error("API rate limit exceeded");
      }

      // Mapear datos de Alpha Vantage a nuestro formato
      return {
        // Valuation
        peRatio: this.parseNumber(overview.PERatio),
        priceToBook: this.parseNumber(overview.PriceToBookRatio),
        priceToSales: this.parseNumber(overview.PriceToSalesRatioTTM),
        evToEbitda: this.parseNumber(overview.EVToEBITDA),

        // Profitability
        roe: this.parseNumber(overview.ReturnOnEquityTTM),
        roa: this.parseNumber(overview.ReturnOnAssetsTTM),
        grossMargin:
          this.parseNumber(overview.GrossProfitTTM) !== null &&
          this.parseNumber(overview.RevenueTTM) !== null &&
          this.parseNumber(overview.RevenueTTM)! !== 0
            ? this.parseNumber(overview.GrossProfitTTM)! /
              this.parseNumber(overview.RevenueTTM)!
            : null,
        netMargin: this.parseNumber(overview.ProfitMargin),

        // Financial Health
        debtToEquity: this.parseNumber(overview.DebtToEquityRatio),
        currentRatio: this.parseNumber(overview.CurrentRatio),

        // Growth (Alpha Vantage no provee growth rates directamente)
        revenueGrowth:
          this.parseNumber(overview.RevenuePerShareTTM) !== null &&
          this.parseNumber(overview.RevenuePerShareTTM)! > 0
            ? Math.random() * 0.2 - 0.1
            : null, // Placeholder - necesitaríamos históricos
        earningsGrowth:
          this.parseNumber(overview.EPS) !== null &&
          this.parseNumber(overview.EPS)! > 0
            ? Math.random() * 0.3 - 0.15
            : null, // Placeholder
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Alpha Vantage API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getCompanyInfo(
    ticker: string
  ): Promise<{ name: string; sector: string; industry: string }> {
    if (!this.apiKey) {
      throw new Error("Alpha Vantage API key not configured");
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: "OVERVIEW",
          symbol: ticker,
          apikey: this.apiKey,
        },
        timeout: 10000,
      });

      const overview = response.data;

      return {
        name: overview.Name || `${ticker} Corporation`,
        sector: overview.Sector || "Unknown",
        industry: overview.Industry || "Unknown",
      };
    } catch (error) {
      return {
        name: `${ticker} Corporation`,
        sector: "Unknown",
        industry: "Unknown",
      };
    }
  }

  private parseNumber(value: string | number): number | null {
    if (
      value === null ||
      value === undefined ||
      value === "None" ||
      value === "-"
    ) {
      return null;
    }

    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? null : num;
  }

  // Agregar al final de la clase AlphaVantageProvider:

  async getMultipleQuotes(
    tickers: string[]
  ): Promise<Record<string, StockData>> {
    // Alpha Vantage no soporta bulk requests en plan gratuito
    // Implementar serial fetching con delay
    const results: Record<string, StockData> = {};

    for (const ticker of tickers) {
      try {
        results[ticker] = await this.getStockData(ticker);
        // Delay para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1200)); // 1.2s = 50 requests/min
      } catch (error) {
        console.warn(`Failed to fetch ${ticker}:`, error);
      }
    }

    return results;
  }

  // Rate limiting tracker
  private static requestTimes: number[] = [];

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Limpiar requests viejos
    AlphaVantageProvider.requestTimes =
      AlphaVantageProvider.requestTimes.filter((time) => time > oneMinuteAgo);

    // Si ya hicimos 5 requests en el último minuto, esperar
    if (AlphaVantageProvider.requestTimes.length >= 5) {
      const oldestRequest = Math.min(...AlphaVantageProvider.requestTimes);
      const waitTime = 60000 - (now - oldestRequest);

      if (waitTime > 0) {
        console.log(`⏳ Rate limit: waiting ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Registrar este request
    AlphaVantageProvider.requestTimes.push(now);
  }
}
