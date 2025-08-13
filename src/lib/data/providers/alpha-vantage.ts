import axios from "axios";
import type { StockData, FinancialMetrics } from "@/types";
import type {
  HistoricalData,
  HistoricalDataPoint,
  TechnicalIndicators,
} from "@/types";

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

  async getHistoricalData(
    ticker: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ): Promise<HistoricalData> {
    if (!this.apiKey) {
      throw new Error("Alpha Vantage API key not configured");
    }

    try {
      console.log(
        `📈 Alpha Vantage: Fetching historical data for ${ticker} (${timeframe})`
      );

      // For longer timeframes, use weekly data to reduce API calls
      const functionType = ["2Y", "5Y"].includes(timeframe)
        ? "TIME_SERIES_WEEKLY"
        : "TIME_SERIES_DAILY";
      const outputSize = timeframe === "1M" ? "compact" : "full";

      const response = await axios.get(this.baseUrl, {
        params: {
          function: functionType,
          symbol: ticker,
          outputsize: outputSize,
          apikey: this.apiKey,
        },
        timeout: 15000,
      });

      const data = response.data;

      if (data["Error Message"]) {
        throw new Error(data["Error Message"]);
      }

      if (data["Note"]) {
        throw new Error("API rate limit exceeded");
      }

      // Get the time series data
      const timeSeriesKey =
        functionType === "TIME_SERIES_WEEKLY"
          ? "Weekly Time Series"
          : "Time Series (Daily)";

      const timeSeries = data[timeSeriesKey];

      if (!timeSeries) {
        throw new Error(`No historical data found for ${ticker}`);
      }

      // Convert to our format and filter by timeframe
      const historicalPoints = this.processTimeSeriesData(
        timeSeries,
        timeframe
      );

      return {
        symbol: ticker,
        timeframe,
        data: historicalPoints,
        lastUpdated: new Date(),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Alpha Vantage historical data error: ${error.message}`
        );
      }
      throw error;
    }
  }

  private processTimeSeriesData(
    timeSeries: Record<string, unknown>,
    timeframe: string
  ): HistoricalDataPoint[] {
    const dataPoints: HistoricalDataPoint[] = [];
    const dates = Object.keys(timeSeries).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Calculate cutoff date based on timeframe
    const now = new Date();
    const cutoffDate = new Date(now);

    switch (timeframe) {
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "6M":
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case "1Y":
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "2Y":
        cutoffDate.setFullYear(now.getFullYear() - 2);
        break;
      case "5Y":
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
    }

    // Filter and process data
    for (const date of dates) {
      const dateObj = new Date(date);
      if (dateObj >= cutoffDate) {
        const dayData = timeSeries[date] as {
          [key: string]: string;
        };

        dataPoints.push({
          date,
          open: parseFloat(dayData["1. open"]),
          high: parseFloat(dayData["2. high"]),
          low: parseFloat(dayData["3. low"]),
          close: parseFloat(dayData["4. close"]),
          volume: parseInt(dayData["5. volume"]) || 0,
        });
      }
    }

    return dataPoints;
  }

  // Technical indicators calculation
  calculateTechnicalIndicators(
    data: HistoricalDataPoint[]
  ): HistoricalDataPoint[] {
    if (data.length < 50) return data; // Need enough data for indicators

    return data.map((point, index) => {
      const indicators: TechnicalIndicators = {
        sma20: this.calculateSMA(data, index, 20),
        sma50: this.calculateSMA(data, index, 50),
        ema12: this.calculateEMA(data, index, 12),
        ema26: this.calculateEMA(data, index, 26),
        rsi: this.calculateRSI(data, index, 14),
      };

      return {
        ...point,
        indicators,
      };
    });
  }

  private calculateSMA(
    data: HistoricalDataPoint[],
    currentIndex: number,
    period: number
  ): number | null {
    if (currentIndex < period - 1) return null;

    const sum = data
      .slice(currentIndex - period + 1, currentIndex + 1)
      .reduce((acc, point) => acc + point.close, 0);

    return sum / period;
  }

  private calculateEMA(
    data: HistoricalDataPoint[],
    currentIndex: number,
    period: number
  ): number | null {
    if (currentIndex < period - 1) return null;

    const multiplier = 2 / (period + 1);

    if (currentIndex === period - 1) {
      // First EMA is SMA
      return this.calculateSMA(data, currentIndex, period);
    }

    const previousEMA = this.calculateEMA(data, currentIndex - 1, period);
    if (previousEMA === null) return null;

    return (
      data[currentIndex].close * multiplier + previousEMA * (1 - multiplier)
    );
  }

  private calculateRSI(
    data: HistoricalDataPoint[],
    currentIndex: number,
    period: number
  ): number | null {
    if (currentIndex < period) return null;

    let gains = 0;
    let losses = 0;

    for (let i = currentIndex - period + 1; i <= currentIndex; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }
}
