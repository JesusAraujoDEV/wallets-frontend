// User preference for which BCV-quoted currency to show as the reference
// conversion (account balances, rate cards). Purely a display choice — the
// app's accounting stays in USD internally (amountUsd, totals) regardless.
import { useEffect, useState } from "react";
import type { ExchangeRate } from "@/lib/rates";

export type DisplayCurrency = "USD" | "EUR" | "USDT";

const STORAGE_KEY = "pwi_display_currency";
const EVENT = "pwi_display_currency_change";

export const DISPLAY_CURRENCIES: { value: DisplayCurrency; label: string; symbol: string }[] = [
  { value: "USD", label: "Dólar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "USDT", label: "USDT", symbol: "₮" },
];

export function getDisplayCurrency(): DisplayCurrency {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "EUR" || v === "USDT" ? v : "USD";
  } catch {
    return "USD";
  }
}

export function setDisplayCurrency(value: DisplayCurrency) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  } catch {
    // ignore storage errors
  }
}

export function useDisplayCurrency() {
  const [value, setValue] = useState<DisplayCurrency>(getDisplayCurrency);

  useEffect(() => {
    const onChange = (e: Event) => setValue((e as CustomEvent<DisplayCurrency>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  return [value, setDisplayCurrency] as const;
}

// VES-per-unit for the given display currency, or null if the rate doesn't carry it.
export function vesPerUnit(rate: ExchangeRate | null | undefined, currency: DisplayCurrency): number | null {
  if (!rate) return null;
  if (currency === "USD") return rate.usdRate || null;
  if (currency === "EUR") return rate.eurRate || null;
  return rate.usdtRate || null;
}

export function currencySymbol(currency: DisplayCurrency): string {
  return DISPLAY_CURRENCIES.find((c) => c.value === currency)?.symbol ?? "$";
}
