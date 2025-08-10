"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

export default function Home() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!ticker.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/analysis/${ticker.toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Analysis failed");
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

  const formatNumber = (num: number | null, decimals = 2) => {
    if (num === null || num === undefined) return "N/A";
    return num.toFixed(decimals);
  };

  const formatPercentage = (num: number | null) => {
    if (num === null || num === undefined) return "N/A";
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Financial Analyzer
          </h1>
          <p className="text-xl text-gray-600">
            Análisis inteligente de acciones con datos reales y IA
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ingresa ticker (ej: AAPL, MSFT, GOOGL, TSLA)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !ticker.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
            >
              {loading ? "Analizando..." : "Analizar"}
            </button>
          </div>

          {/* Quick buttons */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "NVDA"].map((symbol) => (
              <button
                key={symbol}
                onClick={() => {
                  setTicker(symbol);
                  if (!loading) {
                    setTicker(symbol);
                    setTimeout(() => handleAnalyze(), 100);
                  }
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                disabled={loading}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">
              Obteniendo datos reales de Alpha Vantage...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">❌</span>
              <div>
                <p className="font-semibold">Error en el análisis</p>
                <p className="text-sm">{error}</p>
                {error.includes("rate limit") && (
                  <p className="text-xs mt-1">
                    💡 Intenta de nuevo en 1 minuto o prueba otro ticker
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Company Header */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {result.stockData.companyName} ({result.ticker})
                </h2>
                <div className="flex items-center gap-6 text-xl">
                  <span className="font-bold text-2xl">
                    ${result.stockData.price.toFixed(2)}
                  </span>
                  <div
                    className={`flex items-center gap-1 font-semibold ${
                      result.stockData.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.stockData.change >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    {result.stockData.change >= 0 ? "+" : ""}
                    {result.stockData.change.toFixed(2)}(
                    {result.stockData.changePercent.toFixed(2)}%)
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Volumen: {result.stockData.volume?.toLocaleString() || "N/A"}
                  {result.stockData.marketCap > 0 && (
                    <span className="ml-4">
                      Cap. Mercado: $
                      {(result.stockData.marketCap / 1e9).toFixed(1)}B
                    </span>
                  )}
                </div>
              </div>

              {/* Investment Score */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">
                    <span
                      className={`${
                        result.score.overall >= 75
                          ? "text-green-600"
                          : result.score.overall >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {result.score.overall.toFixed(0)}
                    </span>
                    <span className="text-gray-400">/100</span>
                  </div>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      result.score.recommendation === "BUY"
                        ? "bg-green-100 text-green-800"
                        : result.score.recommendation === "HOLD"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {result.score.recommendation}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Confianza: {result.score.confidence}% | Riesgo:{" "}
                    {result.score.riskLevel}
                  </div>

                  {/* Data Sources */}
                  {result.sources && (
                    <div className="text-xs text-gray-500 mt-3 flex gap-4 justify-center">
                      <span>📊 Stock: {result.sources.stockData}</span>
                      <span>📈 Métricas: {result.sources.metrics}</span>
                      {result.processingTime && (
                        <span>⚡ {result.processingTime}ms</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.score.breakdown).map(
                    ([category, score]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm text-gray-600 capitalize mb-1">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-lg font-semibold">
                          {(score as number).toFixed(0)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold mb-6">
                📊 Métricas Financieras Clave
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">P/E Ratio</div>
                  <div className="text-xl font-bold">
                    {formatNumber(result.metrics.peRatio, 1)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ROE</div>
                  <div className="text-xl font-bold">
                    {formatPercentage(result.metrics.roe)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Debt/Equity</div>
                  <div className="text-xl font-bold">
                    {formatNumber(result.metrics.debtToEquity, 2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Net Margin</div>
                  <div className="text-xl font-bold">
                    {formatPercentage(result.metrics.netMargin)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">P/B Ratio</div>
                  <div className="text-xl font-bold">
                    {formatNumber(result.metrics.priceToBook, 1)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Current Ratio
                  </div>
                  <div className="text-xl font-bold">
                    {formatNumber(result.metrics.currentRatio, 2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    Revenue Growth
                  </div>
                  <div className="text-xl font-bold">
                    {formatPercentage(result.metrics.revenueGrowth)}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ROA</div>
                  <div className="text-xl font-bold">
                    {formatPercentage(result.metrics.roa)}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                🤖 Análisis Inteligente
                <span className="text-sm font-normal text-gray-500">
                  {process.env.NEXT_PUBLIC_AI_PROVIDER === "groq"
                    ? "Groq Llama 3.1"
                    : "Mock Analysis"}
                </span>
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800">
                    📋 Resumen Ejecutivo
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {result.aiAnalysis.summary}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700 flex items-center gap-2">
                      ✅ Fortalezas
                    </h4>
                    <ul className="space-y-2">
                      {result.aiAnalysis.strengths.map(
                        (strength: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 p-2 bg-green-50 rounded border-l-4 border-green-200"
                          >
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-red-700 flex items-center gap-2">
                      ⚠️ Debilidades
                    </h4>
                    <ul className="space-y-2">
                      {result.aiAnalysis.weaknesses.map(
                        (weakness: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 p-2 bg-red-50 rounded border-l-4 border-red-200"
                          >
                            {weakness}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-700 flex items-center gap-2">
                      🚨 Riesgos Clave
                    </h4>
                    <ul className="space-y-2">
                      {result.aiAnalysis.keyRisks.map(
                        (risk: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 p-2 bg-orange-50 rounded border-l-4 border-orange-200"
                          >
                            {risk}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-blue-700 flex items-center gap-2">
                      🚀 Catalizadores
                    </h4>
                    <ul className="space-y-2">
                      {result.aiAnalysis.catalysts.map(
                        (catalyst: string, index: number) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 p-2 bg-blue-50 rounded border-l-4 border-blue-200"
                          >
                            {catalyst}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3 text-gray-800">
                    💡 Razonamiento de la Recomendación
                  </h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {result.aiAnalysis.recommendationReasoning}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
