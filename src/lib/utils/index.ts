import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number | null): string => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};

export const formatLargeNumber = (value: number | null): string => {
  if (value === null || value === undefined) return "N/A";

  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  } else if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

export const formatNumber = (value: number | null, decimals = 2): string => {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(decimals);
};

export const isValidTicker = (ticker: string): boolean => {
  const tickerRegex = /^[A-Z]{1,5}$/;
  return tickerRegex.test(ticker.toUpperCase());
};
