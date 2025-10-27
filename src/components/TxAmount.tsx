import { useEffect, useState } from "react";
import type { Transaction, Account } from "@/lib/types";
import { convertToUSDByDate } from "@/lib/rates";

/**
 * Presentational amount renderer with USD equivalence.
 * Inputs:
 * - transaction: source transaction
 * - accounts: list of accounts to derive currency when missing on tx
 * - rateForDate: optional rate for the day to avoid per-row async lookups
 */
export const TxAmount = ({ transaction, accounts, rateForDate }: { transaction: Transaction; accounts: Account[]; rateForDate?: number | null }) => {
  const acc = accounts.find(a => a.id === transaction.accountId);
  const currency = transaction.currency ?? acc?.currency ?? "USD";
  const sign = transaction.type === "income" ? "+" : "-";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "Bs.";
  const [usd, setUsd] = useState<number | null>(transaction.amountUsd ?? null);

  useEffect(() => {
    let mounted = true;
    // If server provided USD equivalence, prefer it; else compute client-side
    if (transaction.amountUsd != null) {
      setUsd(transaction.amountUsd);
      return;
    }
    if (currency === 'USD') {
      setUsd(transaction.amount);
      return;
    }
    // If we have the per-day rate from parent, compute synchronously for stability
    if (rateForDate != null && isFinite(rateForDate) && rateForDate > 0) {
      const value = transaction.amount / rateForDate;
      setUsd(value);
      return;
    }
    // Fallback to historical fetch
    (async () => {
      const converted = await convertToUSDByDate(transaction.amount, currency as any, transaction.date);
      if (mounted) setUsd(converted);
    })();
    return () => { mounted = false; };
  }, [transaction.amount, transaction.date, currency, transaction.amountUsd, rateForDate]);

  return (
    <div className={`text-right ${transaction.type === "income" ? "text-primary" : "text-destructive"}`}>
      <div className="text-lg font-semibold">
        {sign}{symbol}{transaction.amount.toFixed(2)}
      </div>
      {currency !== "USD" && usd != null ? (
        <div className="text-xs text-muted-foreground">≈ {sign}${usd.toFixed(2)} USD</div>
      ) : null}
    </div>
  );
};
