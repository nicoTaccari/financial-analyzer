import { useState, useCallback } from "react";

export function useWatchlist(
  initialWatchlist: string[] = ["AAPL", "MSFT", "GOOGL"]
) {
  const [watchlist, setWatchlist] = useState<string[]>(initialWatchlist);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      if (!prev.includes(symbol)) {
        return [...prev, symbol];
      }
      return prev;
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => {
      return watchlist.includes(symbol);
    },
    [watchlist]
  );

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  };
}
