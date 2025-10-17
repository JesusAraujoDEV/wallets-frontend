// Simple client-side exchange rate helper for VES to USD equivalence
// Data source: https://api.dolarvzla.com/public/exchange-rate

type ApiResponse = {
  current: {
    usd: number;
    eur: number;
    date: string; // YYYY-MM-DD
  };
  previous: {
    usd: number;
    eur: number;
    date: string;
  };
  changePercentage: {
    usd: number;
    eur: number;
  };
};

export type ExchangeSnapshot = {
  vesPerUsd: number; // VES per 1 USD
  vesPerEur: number; // VES per 1 EUR
  fetchedAt: string; // ISO timestamp
  sourceDate: string; // date provided by API
};

const STORAGE_KEY = "pwi_exchange_rate";
const API_URL = "https://api.dolarvzla.com/public/exchange-rate";

function readCache(): ExchangeSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ExchangeSnapshot) : null;
  } catch {
    return null;
  }
}

function writeCache(data: ExchangeSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export async function getVESPerUsd(forceRefresh = false): Promise<ExchangeSnapshot | null> {
  const cached = readCache();
  // If we have cache from same calendar day, use it unless forceRefresh
  if (!forceRefresh && cached) {
    const today = new Date().toISOString().slice(0, 10);
    if (cached.sourceDate === today) return cached;
  }

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as ApiResponse;
    const snapshot: ExchangeSnapshot = {
      vesPerUsd: Number(json.current.usd),
      vesPerEur: Number(json.current.eur),
      fetchedAt: new Date().toISOString(),
      sourceDate: json.current.date,
    };
    writeCache(snapshot);
    return snapshot;
  } catch (err) {
    // On error, fall back to cache if available
    return cached ?? null;
  }
}

// Convenience converter: takes a VES amount and returns USD using latest known rate (cached or fetched)
export async function vesToUsd(amountVES: number): Promise<number | null> {
  const snap = await getVESPerUsd();
  if (!snap || !snap.vesPerUsd || !isFinite(snap.vesPerUsd)) return null;
  if (!isFinite(amountVES)) return null;
  return amountVES / snap.vesPerUsd;
}

// React hook variant for components
import { useEffect, useState } from "react";
export function useVESExchangeRate() {
  const [rate, setRate] = useState<ExchangeSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const snap = await getVESPerUsd();
        if (mounted) setRate(snap);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Failed to load exchange rate");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { rate, loading, error } as const;
}

// Convert a value in a given currency to USD using the snapshot
export function convertToUSD(amount: number, currency: "USD" | "EUR" | "VES", snap: ExchangeSnapshot | null): number | null {
  if (!isFinite(amount)) return null;
  if (!snap) return null;
  switch (currency) {
    case "USD":
      return amount;
    case "VES":
      return amount / (snap.vesPerUsd || NaN);
    case "EUR": {
      // EUR -> USD: (VES/EUR) / (VES/USD) = USD per EUR
      if (!snap.vesPerUsd || !snap.vesPerEur) return null;
      const usdPerEur = snap.vesPerEur / snap.vesPerUsd;
      return amount * usdPerEur;
    }
    default:
      return null;
  }
}
