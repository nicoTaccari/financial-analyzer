"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  Activity,
  Briefcase,
  Star,
  StarOff,
} from "lucide-react";

import { StockChart } from "@/components/charts/StockChart";
import type { HistoricalData } from "@/types";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [watchlist, setWatchlist] = useState<string[]>([
    "AAPL",
    "MSFT",
    "GOOGL",
  ]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(
    null
  );
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y"
  >("1Y");

  const fetchHistoricalData = async (
    tickerSymbol: string,
    timeframe: "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" = "1Y"
  ) => {
    setChartLoading(true);
    setChartError("");

    try {
      const response = await fetch(
        `/api/historical/${tickerSymbol.toUpperCase()}?timeframe=${timeframe}`
      );
      const data = await response.json();

      if (data.success) {
        setHistoricalData(data.data.data);
        setSelectedTimeframe(timeframe);
      } else {
        setChartError(data.error || "Failed to fetch historical data");
      }
    } catch (err) {
      setChartError("Network error while fetching chart data");
    } finally {
      setChartLoading(false);
    }
  };

  const handleAnalyze = async (tickerSymbol?: string) => {
    const symbolToAnalyze = tickerSymbol || ticker;
    if (!symbolToAnalyze.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setHistoricalData(null); // Reset chart data

    try {
      // Fetch both analysis and historical data in parallel
      const [analysisResponse] = await Promise.all([
        fetch(`/api/analysis/${symbolToAnalyze.toUpperCase()}`),
        fetchHistoricalData(symbolToAnalyze, selectedTimeframe), // Fetch historical data
      ]);

      const analysisData = await analysisResponse.json();

      if (analysisData.success) {
        setResult(analysisData.data);
        setTicker(symbolToAnalyze.toUpperCase());
      } else {
        setError(analysisData.error || "Analysis failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  // Watchlist management
  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
  };

  const addToComparison = () => {
    if (result && !comparison.find((c) => c.ticker === result.ticker)) {
      setComparison([...comparison, result]);
    }
  };

  // Your existing formatting functions - keeping them exactly as is
  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number | null) => {
    if (num === null || num === undefined) return "N/A";
    return `${(num * 100).toFixed(1)}%`;
  };

  // Enhanced formatting functions
  const formatLargeNumber = (value: number) => {
    if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === "BUY")
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (rec === "HOLD") return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Financial Analyzer
                  </h1>
                  <p className="text-sm text-slate-600 font-medium">
                    AI-Powered Investment Intelligence
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-lg">
                <Target className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  Watchlist: {watchlist.length}
                </span>
              </div>

              {comparison.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Comparing: {comparison.length}
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-100 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Live Data
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Analyze Any Stock
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get real-time data, comprehensive financial metrics, and
              AI-powered investment insights
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter stock ticker (e.g., AAPL, MSFT, GOOGL)"
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-slate-900 placeholder-slate-500 transition-all duration-200 bg-white"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !ticker.trim()}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-lg rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:shadow-none min-w-[160px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {/* Enhanced Quick Access */}
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm font-semibold text-slate-600 mr-2">
                Popular Stocks:
              </span>
              {[
                "AAPL",
                "MSFT",
                "GOOGL",
                "TSLA",
                "AMZN",
                "NVDA",
                "META",
                "NFLX",
              ].map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleAnalyze(symbol)}
                  className="px-4 py-2 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-200 hover:border-blue-300"
                  disabled={loading}
                >
                  {symbol}
                </button>
              ))}
            </div>

            {watchlist.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-sm font-semibold text-slate-600 mr-2">
                  Your Watchlist:
                </span>
                {watchlist.map((symbol) => (
                  <div
                    key={symbol}
                    className="flex items-center bg-blue-50 border border-blue-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => handleAnalyze(symbol)}
                      disabled={loading}
                      className="px-3 py-2 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors duration-200"
                    >
                      {symbol}
                    </button>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(symbol);
                      }}
                      className="px-2 py-2 text-blue-600 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-200 border-l border-blue-200"
                      role="button"
                      aria-label={`Remove ${symbol} from watchlist`}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="relative">
              <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Analyzing {ticker}
            </h3>
            <p className="text-lg text-slate-600 mb-2">
              Fetching real-time market data...
            </p>
            <p className="text-sm text-slate-500">
              This may take a few seconds
            </p>

            <div className="mt-6 flex justify-center space-x-8 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Alpha Vantage API</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Scoring Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 mb-2">
                  Analysis Error
                </h3>
                <p className="text-red-800 text-lg mb-3">{error}</p>
                {error.includes("rate limit") && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700 font-medium">
                      💡 Rate limit reached. Please wait a moment and try again,
                      or try a different ticker.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setError("")}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results */}
        {result && (
          <div className="space-y-8">
            {/* Company Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <h2 className="text-3xl font-bold">
                        {result.stockData.companyName}
                      </h2>
                      <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium">
                        {result.ticker}
                      </span>
                    </div>

                    <div className="flex items-center space-x-8 text-xl">
                      <span className="text-5xl font-bold">
                        ${result.stockData.price.toFixed(2)}
                      </span>
                      <div
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                          result.stockData.change >= 0
                            ? "bg-emerald-500/20 text-emerald-100"
                            : "bg-red-500/20 text-red-100"
                        }`}
                      >
                        {result.stockData.change >= 0 ? (
                          <TrendingUp className="w-6 h-6" />
                        ) : (
                          <TrendingDown className="w-6 h-6" />
                        )}
                        <span className="text-xl font-bold">
                          {result.stockData.change >= 0 ? "+" : ""}
                          {result.stockData.change.toFixed(2)}(
                          {result.stockData.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-6xl font-bold mb-3 text-white">
                      {result.score.overall.toFixed(0)}
                    </div>
                    <div
                      className={`inline-flex items-center px-6 py-3 rounded-xl text-lg font-bold border-2 ${getRecommendationColor(
                        result.score.recommendation
                      )}`}
                    >
                      {result.score.recommendation}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    {
                      label: "Volume",
                      value: formatLargeNumber(result.stockData.volume || 0),
                    },
                    {
                      label: "Market Cap",
                      value:
                        result.stockData.marketCap > 0
                          ? `$${formatLargeNumber(result.stockData.marketCap)}`
                          : "N/A",
                    },
                    {
                      label: "Confidence",
                      value: `${result.score.confidence}%`,
                    },
                    { label: "Risk Level", value: result.score.riskLevel },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm opacity-90 font-medium mb-1">
                        {item.label}
                      </div>
                      <div className="text-xl font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => addToWatchlist(result.ticker)}
                      disabled={watchlist.includes(result.ticker)}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      {watchlist.includes(result.ticker) ? (
                        <Star className="w-5 h-5 fill-current" />
                      ) : (
                        <StarOff className="w-5 h-5" />
                      )}
                      <span>
                        {watchlist.includes(result.ticker)
                          ? "In Watchlist"
                          : "Add to Watchlist"}
                      </span>
                    </button>

                    <button
                      onClick={addToComparison}
                      disabled={comparison.find(
                        (c) => c.ticker === result.ticker
                      )}
                      className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span>
                        {comparison.find((c) => c.ticker === result.ticker)
                          ? "Already Comparing"
                          : "Add to Compare"}
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        Updated:{" "}
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Data Sources */}
                    {result.sources && (
                      <div className="flex items-center space-x-4 text-xs font-medium">
                        <span className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>Stock: {result.sources.stockData}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Metrics: {result.sources.metrics}</span>
                        </span>
                        {result.processingTime && (
                          <span className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>{result.processingTime}ms</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50">
                <nav className="flex space-x-8 px-8">
                  {[
                    { id: "overview", name: "Score Overview", icon: BarChart3 },
                    {
                      id: "metrics",
                      name: "Financial Metrics",
                      icon: DollarSign,
                    },
                    { id: "charts", name: "Price Charts", icon: LineChart },
                    { id: "analysis", name: "AI Analysis", icon: Activity },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-3 py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-700 bg-blue-50"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === "overview" && (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      Investment Score Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Object.entries(result.score.breakdown).map(
                        ([category, score]) => (
                          <div
                            key={category}
                            className={`rounded-xl p-6 border-2 ${getScoreBgColor(
                              score as number
                            )}`}
                          >
                            <div className="text-center">
                              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
                                {category.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div
                                className={`text-4xl font-bold mb-4 ${getScoreColor(
                                  score as number
                                )}`}
                              >
                                {(score as number).toFixed(0)}
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-3 rounded-full transition-all duration-1000 ${
                                    (score as number) >= 75
                                      ? "bg-emerald-500"
                                      : (score as number) >= 50
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "metrics" && (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      Key Financial Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          label: "P/E Ratio",
                          value: formatNumber(result.metrics.peRatio, 1),
                          desc: "Price-to-Earnings",
                          category: "valuation",
                        },
                        {
                          label: "ROE",
                          value: formatPercentage(result.metrics.roe),
                          desc: "Return on Equity",
                          category: "profitability",
                        },
                        {
                          label: "Debt/Equity",
                          value: formatNumber(result.metrics.debtToEquity, 2),
                          desc: "Financial Leverage",
                          category: "health",
                        },
                        {
                          label: "Net Margin",
                          value: formatPercentage(result.metrics.netMargin),
                          desc: "Profitability",
                          category: "profitability",
                        },
                        {
                          label: "P/B Ratio",
                          value: formatNumber(result.metrics.priceToBook, 1),
                          desc: "Price-to-Book",
                          category: "valuation",
                        },
                        {
                          label: "Current Ratio",
                          value: formatNumber(result.metrics.currentRatio, 2),
                          desc: "Liquidity",
                          category: "health",
                        },
                        {
                          label: "Revenue Growth",
                          value: formatPercentage(result.metrics.revenueGrowth),
                          desc: "Year-over-Year",
                          category: "growth",
                        },
                        {
                          label: "ROA",
                          value: formatPercentage(result.metrics.roa),
                          desc: "Return on Assets",
                          category: "profitability",
                        },
                      ].map((metric, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:bg-slate-100 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                            {metric.label}
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mb-2">
                            {metric.value}
                          </div>
                          <div className="text-sm text-slate-500 font-medium">
                            {metric.desc}
                          </div>
                          <div
                            className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                              metric.category === "valuation"
                                ? "bg-blue-100 text-blue-700"
                                : metric.category === "profitability"
                                ? "bg-emerald-100 text-emerald-700"
                                : metric.category === "growth"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {metric.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "charts" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                        <LineChart className="w-7 h-7" />
                        <span>Price Charts & Technical Analysis</span>
                      </h3>
                      {historicalData && (
                        <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {historicalData.data.length} data points
                        </div>
                      )}
                    </div>

                    {/* Chart Component */}
                    {historicalData ? (
                      <StockChart
                        data={historicalData}
                        loading={chartLoading}
                        error={chartError}
                        onTimeframeChange={(timeframe) => {
                          if (result) {
                            fetchHistoricalData(result.ticker, timeframe);
                          }
                        }}
                      />
                    ) : chartLoading ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="relative">
                          <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <LineChart className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                          Loading Chart Data
                        </h3>
                        <p className="text-lg text-slate-600 mb-2">
                          Fetching historical prices...
                        </p>
                        <p className="text-sm text-slate-500">
                          This may take a few seconds
                        </p>
                      </div>
                    ) : chartError ? (
                      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-red-900 mb-2">
                              Chart Data Error
                            </h3>
                            <p className="text-red-800 text-lg mb-3">
                              {chartError}
                            </p>
                            <button
                              onClick={() =>
                                result &&
                                fetchHistoricalData(
                                  result.ticker,
                                  selectedTimeframe
                                )
                              }
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
                        <LineChart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                          No Chart Data Available
                        </h3>
                        <p className="text-slate-600">
                          Analyze a stock to see historical price charts
                        </p>
                      </div>
                    )}

                    {/* Quick Chart Actions */}
                    {historicalData && (
                      <div className="mt-8 bg-slate-50 rounded-xl p-6">
                        <h4 className="font-semibold text-slate-900 mb-4">
                          Quick Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-sm font-medium text-slate-600 mb-1">
                              Price Movement
                            </div>
                            <div
                              className={`text-lg font-bold ${
                                historicalData.data[
                                  historicalData.data.length - 1
                                ]?.close > historicalData.data[0]?.close
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(
                                ((historicalData.data[
                                  historicalData.data.length - 1
                                ]?.close -
                                  historicalData.data[0]?.close) /
                                  historicalData.data[0]?.close) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                            <div className="text-xs text-slate-500">
                              {selectedTimeframe} period return
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-sm font-medium text-slate-600 mb-1">
                              Volatility
                            </div>
                            <div className="text-lg font-bold text-slate-900">
                              {(() => {
                                const returns = historicalData.data
                                  .slice(1)
                                  .map((point, i) =>
                                    Math.log(
                                      point.close / historicalData.data[i].close
                                    )
                                  );
                                const variance =
                                  returns.reduce(
                                    (sum, ret) => sum + ret * ret,
                                    0
                                  ) / returns.length;
                                return (
                                  Math.sqrt(variance) *
                                  Math.sqrt(252) *
                                  100
                                ).toFixed(1); // Annualized volatility
                              })()}
                              %
                            </div>
                            <div className="text-xs text-slate-500">
                              Annualized volatility
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="text-sm font-medium text-slate-600 mb-1">
                              Trend Strength
                            </div>
                            <div className="text-lg font-bold text-blue-600">
                              {(() => {
                                const closes = historicalData.data.map(
                                  (d) => d.close
                                );
                                const upDays = closes
                                  .slice(1)
                                  .filter(
                                    (close, i) => close > closes[i]
                                  ).length;
                                return Math.round(
                                  (upDays / (closes.length - 1)) * 100
                                );
                              })()}
                              %
                            </div>
                            <div className="text-xs text-slate-500">
                              Positive days ratio
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "analysis" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">
                        AI-Powered Analysis
                      </h3>
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {result.aiProvider || "Enhanced Analysis"}
                      </span>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-bold text-blue-900 text-lg mb-4 flex items-center space-x-3">
                          <Activity className="w-6 h-6" />
                          <span>📋 Executive Summary</span>
                        </h4>
                        <p className="text-blue-800 leading-relaxed text-lg">
                          {result.aiAnalysis.summary}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                          <h4 className="font-bold text-emerald-900 text-lg mb-4 flex items-center space-x-3">
                            <TrendingUp className="w-6 h-6" />
                            <span>✅ Strengths</span>
                          </h4>
                          <ul className="space-y-3">
                            {result.aiAnalysis.strengths.map(
                              (strength: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-emerald-800 flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {strength}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                          <h4 className="font-bold text-red-900 text-lg mb-4 flex items-center space-x-3">
                            <AlertTriangle className="w-6 h-6" />
                            <span>⚠️ Weaknesses</span>
                          </h4>
                          <ul className="space-y-3">
                            {result.aiAnalysis.weaknesses.map(
                              (weakness: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-red-800 flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {weakness}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                          <h4 className="font-bold text-amber-900 text-lg mb-4 flex items-center space-x-3">
                            <AlertTriangle className="w-6 h-6" />
                            <span>🚨 Key Risks</span>
                          </h4>
                          <ul className="space-y-3">
                            {result.aiAnalysis.keyRisks.map(
                              (risk: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-amber-800 flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {risk}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                          <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center space-x-3">
                            <TrendingUp className="w-6 h-6" />
                            <span>🚀 Catalysts</span>
                          </h4>
                          <ul className="space-y-3">
                            {result.aiAnalysis.catalysts.map(
                              (catalyst: string, index: number) => (
                                <li
                                  key={index}
                                  className="text-purple-800 flex items-start space-x-3"
                                >
                                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="leading-relaxed">
                                    {catalyst}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center space-x-3">
                          <Briefcase className="w-6 h-6" />
                          <span>💡 Investment Recommendation</span>
                        </h4>
                        <p className="text-slate-800 leading-relaxed text-lg">
                          {result.aiAnalysis.recommendationReasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Comparison Section */}
            {comparison.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                    <BarChart3 className="w-7 h-7" />
                    <span>Stock Comparison ({comparison.length} stocks)</span>
                  </h3>
                  <button
                    onClick={() => setComparison([])}
                    className="px-4 py-2 text-slate-600 hover:text-red-600 font-medium rounded-lg transition-colors duration-200"
                  >
                    Clear All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          Symbol
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          Price
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          Change
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          Score
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          Recommendation
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          P/E
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-slate-900">
                          ROE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((stock, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {stock.ticker}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800">
                            ${stock.stockData.price.toFixed(2)}
                          </td>
                          <td
                            className={`py-4 px-6 font-semibold ${
                              stock.stockData.changePercent >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.stockData.changePercent >= 0 ? "+" : ""}
                            {stock.stockData.changePercent.toFixed(2)}%
                          </td>
                          <td
                            className={`py-4 px-6 font-bold text-lg ${getScoreColor(
                              stock.score.overall
                            )}`}
                          >
                            {stock.score.overall.toFixed(0)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-lg text-sm font-bold border ${getRecommendationColor(
                                stock.score.recommendation
                              )}`}
                            >
                              {stock.score.recommendation}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-700">
                            {formatNumber(stock.metrics.peRatio, 1)}
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-700">
                            {formatPercentage(stock.metrics.roe)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="text-slate-600 space-y-2">
              <p className="text-lg font-semibold">
                Powered by Real-Time Market Data & AI
              </p>
              <div className="flex justify-center items-center space-x-6 text-sm">
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Alpha Vantage API</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Groq AI</span>
                </span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Next.js</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Built with Next.js, TypeScript & Tailwind CSS
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
