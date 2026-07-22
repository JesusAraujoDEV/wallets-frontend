// Exchange rate client — talks only to our own backend (server/services/exchange_rate_service.js),
// which owns the BCV integration, caching, and weekend/holiday fallback. Never call the BCV API
// directly from the frontend: see docs/decisions/0001-... in wallets-backend for why.
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export interface ExchangeRate {
  date: string; // YYYY-MM-DD
  usdRate: number; // VES per 1 USD
  eurRate: number; // VES per 1 EUR
  usdtRate: number | null;
  source?: "live" | "fallback";
}

export async function fetchCurrentRate(): Promise<ExchangeRate> {
  const res = await apiFetch<{ ok: boolean; rate: ExchangeRate }>("exchange-rates/current");
  return res.rate;
}

export async function fetchRateByDate(date: string): Promise<ExchangeRate> {
  const res = await apiFetch<{ ok: boolean; rate: ExchangeRate }>(`exchange-rates/by-date?date=${date}`);
  return res.rate;
}

export async function fetchRateHistory(params?: { from?: string; to?: string }): Promise<ExchangeRate[]> {
  const sp = new URLSearchParams();
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  const qs = sp.toString();
  const res = await apiFetch<{ ok: boolean; rates: ExchangeRate[] }>(`exchange-rates/history${qs ? `?${qs}` : ""}`);
  return res.rates;
}

export function useCurrentExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate", "current"],
    queryFn: fetchCurrentRate,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExchangeRateByDate(date: string | undefined) {
  return useQuery({
    queryKey: ["exchange-rate", "by-date", date],
    queryFn: () => fetchRateByDate(date as string),
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });
}

export function useExchangeRateHistory(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["exchange-rate", "history", params?.from, params?.to],
    queryFn: () => fetchRateHistory(params),
    staleTime: 5 * 60 * 1000,
  });
}

// --- Legacy-shaped surface, kept for existing consumers (AccountManager, AccountSelector,
// ConfirmPaymentModal, DebtPayDialog, PayNowModal, TransactionsList, Index) so this
// architectural fix doesn't require touching every call site in the same change.
// All of it now routes through the backend above — nothing here hits BCV directly anymore.
export interface ExchangeSnapshot {
  vesPerUsd: number;
  vesPerEur: number;
  vesPerUsdt: number | null;
  fetchedAt: string;
  sourceDate: string;
}

function toSnapshot(rate: ExchangeRate): ExchangeSnapshot {
  return {
    vesPerUsd: rate.usdRate,
    vesPerEur: rate.eurRate ?? 0,
    vesPerUsdt: rate.usdtRate ?? null,
    fetchedAt: new Date().toISOString(),
    sourceDate: rate.date,
  };
}

export async function getRateByDate(dateISO: string): Promise<ExchangeSnapshot | null> {
  try {
    return toSnapshot(await fetchRateByDate(dateISO.slice(0, 10)));
  } catch {
    return null;
  }
}

export function useVESExchangeRate() {
  const q = useCurrentExchangeRate();
  return { rate: q.data ? toSnapshot(q.data) : null, loading: q.isLoading, error: q.error ? String(q.error) : null } as const;
}

export function convertToUSD(amount: number, currency: "USD" | "EUR" | "VES", snap: ExchangeSnapshot | null): number | null {
  if (!isFinite(amount)) return null;
  if (!snap) return null;
  switch (currency) {
    case "USD":
      return amount;
    case "VES":
      return snap.vesPerUsd ? amount / snap.vesPerUsd : null;
    case "EUR": {
      if (!snap.vesPerUsd || !snap.vesPerEur) return null;
      return amount * (snap.vesPerEur / snap.vesPerUsd);
    }
    default:
      return null;
  }
}

export async function convertToUSDByDate(amount: number, currency: "USD" | "EUR" | "VES", dateISO?: string): Promise<number | null> {
  if (!isFinite(amount)) return null;
  if (currency === "USD") return amount;
  const snap = dateISO ? await getRateByDate(dateISO) : await getRateByDate(new Date().toISOString().slice(0, 10));
  return convertToUSD(amount, currency, snap);
}
