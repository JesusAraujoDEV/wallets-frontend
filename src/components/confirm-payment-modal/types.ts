import type { Account, Transaction } from "@/lib/types";
import type { ExchangeSnapshot } from "@/lib/rates";

export type Currency = "USD" | "EUR" | "VES";

export interface ConfirmPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingTx: Transaction | null;
  referenceCurrency: Currency;
  referenceAmount: number;
  accounts: Account[];
  onConfirmed: () => void;
}

export function formatAmountWithCurrency(amount: number, currency: Currency): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "Bs.";
  return `${symbol}${Math.abs(amount || 0).toFixed(2)} ${currency}`;
}

export function calculateConvertedAmount(
  referenceAmount: number,
  referenceCurrency: Currency,
  accountCurrency: Currency,
  snapshot: ExchangeSnapshot,
): number | null {
  if (referenceCurrency === accountCurrency) return referenceAmount;
  if (accountCurrency === "VES") {
    if (referenceCurrency === "USD") return snapshot.vesPerUsd * referenceAmount;
    if (referenceCurrency === "EUR") return snapshot.vesPerEur * referenceAmount;
  }
  if (referenceCurrency === "VES") {
    if (accountCurrency === "USD" && snapshot.vesPerUsd) return referenceAmount / snapshot.vesPerUsd;
    if (accountCurrency === "EUR" && snapshot.vesPerEur) return referenceAmount / snapshot.vesPerEur;
  }
  // Cross: EUR→USD or USD→EUR via VES rates
  if (referenceCurrency === "EUR" && accountCurrency === "USD" && snapshot.vesPerEur && snapshot.vesPerUsd) {
    return (snapshot.vesPerEur / snapshot.vesPerUsd) * referenceAmount;
  }
  if (referenceCurrency === "USD" && accountCurrency === "EUR" && snapshot.vesPerUsd && snapshot.vesPerEur) {
    return (snapshot.vesPerUsd / snapshot.vesPerEur) * referenceAmount;
  }
  return null;
}
