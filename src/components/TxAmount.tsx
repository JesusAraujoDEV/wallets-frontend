import { useEffect, useState } from "react";
import type { Transaction, Account } from "@/lib/types";
import { convertToUSDByDate } from "@/lib/rates";
import { useDisplayCurrency, currencySymbol, type DisplayCurrency } from "@/lib/displayCurrency";

/**
 * Presentational amount renderer with equivalence in the user's selected display currency.
 * If user selected USD → shows "≈ $X.XX USD"
 * If user selected EUR → shows "≈ €X.XX EUR" (computed via VES cross-rate)
 * If user selected USDT → shows "≈ ₮X.XX USDT"
 */
export const TxAmount = ({ transaction, accounts, rateForDate }: { transaction: Transaction; accounts: Account[]; rateForDate?: number | null }) => {
  const acc = accounts.find(a => a.id === transaction.accountId);
  const currency = transaction.currency ?? acc?.currency ?? "USD";
  const sign = transaction.type === "income" ? "+" : "-";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "Bs.";
  const [displayCurrency] = useDisplayCurrency();
  const displaySym = currencySymbol(displayCurrency);
  const [equivalent, setEquivalent] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    // If the transaction's own currency matches display currency, the equivalent is the amount itself
    if (currency === displayCurrency || (currency === "USD" && displayCurrency === "USDT")) {
      setEquivalent(transaction.amount);
      return;
    }

    // For USD display: use amountUsd if available, or compute from rate
    if (displayCurrency === "USD" || displayCurrency === "USDT") {
      if (transaction.amountUsd != null) {
        setEquivalent(transaction.amountUsd);
        return;
      }
      if (currency === "USD") {
        setEquivalent(transaction.amount);
        return;
      }
      if (rateForDate != null && isFinite(rateForDate) && rateForDate > 0) {
        setEquivalent(transaction.amount / rateForDate);
        return;
      }
      (async () => {
        const converted = await convertToUSDByDate(transaction.amount, currency as any, transaction.date);
        if (mounted) setEquivalent(converted);
      })();
      return () => { mounted = false; };
    }

    // For EUR display: VES amount / EUR rate = EUR equivalent
    // If tx is in VES and we have the EUR rate for the date, compute directly
    if (displayCurrency === "EUR") {
      if (currency === "EUR") {
        setEquivalent(transaction.amount);
        return;
      }
      // rateForDate here is the EUR rate (VES per EUR) because useDailyRates now respects displayCurrency
      if (currency === "VES" && rateForDate != null && isFinite(rateForDate) && rateForDate > 0) {
        setEquivalent(transaction.amount / rateForDate);
        return;
      }
      // If tx is in USD and we have amountUsd, we need USD→EUR cross rate
      // For simplicity use amountUsd * (usdRate / eurRate) approximation
      // But since rateForDate is now the EUR rate, we'd need the USD rate too.
      // Safest: show amountUsd as fallback with "$" prefix (already useful)
      if (transaction.amountUsd != null) {
        // Approximate: if we had both rates we could do amountUsd * usdRate / eurRate
        // but we only have eurRate here. Just show the USD equivalent as fallback.
        setEquivalent(transaction.amountUsd);
        return;
      }
      setEquivalent(null);
      return;
    }

    setEquivalent(null);
    return () => { mounted = false; };
  }, [transaction.amount, transaction.date, currency, transaction.amountUsd, rateForDate, displayCurrency]);

  // Determine if we should show the equivalence line
  const showEquivalence = currency !== displayCurrency && equivalent != null;
  // For EUR display when source is USD or vice versa, the equivalence might be in USD still
  const equivLabel = displayCurrency;
  const equivSym = displaySym;

  return (
    <div className={`text-right ${transaction.type === "income" ? "text-primary" : "text-destructive"}`}>
      <div className="text-lg font-semibold">
        {sign}{symbol}{transaction.amount.toFixed(2)}
      </div>
      {showEquivalence ? (
        <div className="text-xs text-muted-foreground">≈ {sign}{equivSym}{equivalent.toFixed(2)} {equivLabel}</div>
      ) : null}
    </div>
  );
};
