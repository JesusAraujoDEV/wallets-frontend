import type { BudgetPeriod, RateSource } from "@/lib/types";

const RATE_SOURCE_LABELS: Record<RateSource, string> = {
  bcv: "BCV",
  binance: "Binance",
  eur: "Euro",
  usd: "USD",
};

export function rateSourceLabel(rateSource?: RateSource | null) {
  return rateSource ? RATE_SOURCE_LABELS[rateSource] : null;
}

export function formatMoney(value: number) {
  return `$${Math.abs(value).toFixed(2)}`;
}

export function formatOriginalAmount(value: number, rateSource?: RateSource | null) {
  const symbol = rateSource === "eur" ? "€" : "$";
  return `${symbol}${Math.abs(value).toFixed(2)}`;
}

export function progressColorClass(percentageUsed: number) {
  if (percentageUsed < 80) return "[&>div]:bg-emerald-500";
  if (percentageUsed < 100) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

export function periodBadgeLabel(period: BudgetPeriod, specificMonth?: string | null) {
  if (period === "yearly") {
    return "Anual";
  }

  if (period === "one_time") {
    return specificMonth ? `Solo ${specificMonth}` : "Solo (sin mes)";
  }

  return "Mensual";
}
