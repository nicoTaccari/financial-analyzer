import { useState } from "react";
import { Search } from "lucide-react";

interface SearchSectionProps {
  onAnalyze: (ticker: string) => void;
  loading: boolean;
  watchlist: string[];
  onRemoveFromWatchlist: (symbol: string) => void;
}

const POPULAR_STOCKS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "TSLA",
  "AMZN",
  "NVDA",
  "META",
  "NFLX",
];

export function SearchSection({
  onAnalyze,
  loading,
  watchlist,
  onRemoveFromWatchlist,
}: SearchSectionProps) {
  const [ticker, setTicker] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  const handleAnalyze = () => {
    if (ticker.trim()) {
      onAnalyze(ticker);
    }
  };

  const handleQuickAnalyze = (symbol: string) => {
    setTicker(symbol);
    onAnalyze(symbol);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Analyze Any Stock
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Get real-time data, comprehensive financial metrics, and AI-powered
          investment insights
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
          onClick={handleAnalyze}
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

      {/* Quick Access */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-sm font-semibold text-slate-600 mr-2">
            Popular Stocks:
          </span>
          {POPULAR_STOCKS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleQuickAnalyze(symbol)}
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
                  onClick={() => handleQuickAnalyze(symbol)}
                  disabled={loading}
                  className="px-3 py-2 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors duration-200"
                >
                  {symbol}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWatchlist(symbol);
                  }}
                  className="px-2 py-2 text-blue-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 border-l border-blue-200"
                  aria-label={`Remove ${symbol} from watchlist`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
