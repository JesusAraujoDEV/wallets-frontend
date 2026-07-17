import type { Account, Category, Debt } from "@/lib/types";
import { getRateByDate, type ExchangeSnapshot } from "@/lib/rates";

export type Currency = "USD" | "EUR" | "VES";

export interface DebtPayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  accounts: Account[];
  categories: Category[];
  onConfirm: (payload: {
    amount: number;
    currency: string;
    accountId: number;
    date: string;
    categoryId?: number;
    exchangeRate?: number;
  }) => Promise<void>;
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getDirectExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  snapshot: ExchangeSnapshot,
): number | null {
  if (fromCurrency === toCurrency) return 1;

  if (fromCurrency === "USD" && toCurrency === "VES") return snapshot.vesPerUsd;
  if (fromCurrency === "EUR" && toCurrency === "VES") return snapshot.vesPerEur;
  if (fromCurrency === "VES" && toCurrency === "USD") return 1 / snapshot.vesPerUsd;
  if (fromCurrency === "VES" && toCurrency === "EUR") return 1 / snapshot.vesPerEur;

  if (fromCurrency === "USD" && toCurrency === "EUR") {
    return snapshot.vesPerUsd / snapshot.vesPerEur;
  }
  if (fromCurrency === "EUR" && toCurrency === "USD") {
    return snapshot.vesPerEur / snapshot.vesPerUsd;
  }

  return null;
}

export async function fetchDirectRate(
  fromCurrency: Currency,
  toCurrency: Currency,
  date: string,
): Promise<{ rate: number; sourceDate: string }> {
  const snapshot = await getRateByDate(date);
  if (!snapshot) throw new Error("No se encontró tasa BCV para la fecha seleccionada.");

  const directRate = getDirectExchangeRate(fromCurrency, toCurrency, snapshot);
  if (!directRate || !Number.isFinite(directRate) || directRate <= 0) {
    throw new Error("No se pudo calcular la tasa entre las monedas seleccionadas.");
  }

  return { rate: directRate, sourceDate: snapshot.sourceDate };
}
