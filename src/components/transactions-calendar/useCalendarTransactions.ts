import { useEffect, useRef, useState } from "react";
import type { Dayjs } from "dayjs";
import { apiFetch } from "@/lib/http";
import type { Transaction } from "@/lib/types";
import type { CalendarScope } from "./types";

interface UseCalendarTransactionsArgs {
  currentMonth: Dayjs;
  selectedAccount?: string;
  scope: CalendarScope;
  fallbackLocalTx: Transaction[];
}

// Fetches the current month's transactions from the API, falling back to local store data
// when the server returns nothing for scope "all".
export function useCalendarTransactions({ currentMonth, selectedAccount, scope, fallbackLocalTx }: UseCalendarTransactionsArgs) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep fallbackLocalTx in a ref so it doesn't trigger re-fetches.
  // The fallback is only used when the API returns empty — its identity
  // changing shouldn't cause a new network request.
  const fallbackRef = useRef(fallbackLocalTx);
  fallbackRef.current = fallbackLocalTx;

  const monthKey = currentMonth.format('YYYY-MM');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const sp = new URLSearchParams();
        if (scope === 'stats') sp.set('includeInStats', '1');
        sp.set('month', monthKey);
        if (selectedAccount && selectedAccount !== 'all') sp.set('accountId', selectedAccount);
        const qs = sp.toString();
        const list = await apiFetch<any[]>(`transactions?${qs}`);
        if (!alive) return;
        const mapped: Transaction[] = (list || []).map(t => {
          const rawType = String(t.type ?? '').toLowerCase();
          const type = (rawType === 'income' || rawType === 'ingreso')
            ? 'income'
            : (rawType === 'expense' || rawType === 'gasto')
              ? 'expense'
              : 'expense';
          return {
            id: String(t.id),
            date: String(t.date),
            description: String(t.description ?? ''),
            categoryId: String(t.categoryId ?? t.category_id),
            accountId: String(t.accountId ?? t.account_id),
            amount: Number(t.amount || 0),
            type,
            currency: (t.currency || undefined),
            amountUsd: t.amount_usd ?? t.amountUsd ?? null,
            exchangeRateUsed: t.exchange_rate_used ?? t.exchangeRateUsed ?? null,
          } as Transaction;
        });
        if (mapped.length === 0 && scope === 'all') {
          // Fallback to local store data (read from ref, not dep)
          const localSubset = fallbackRef.current.filter(
            tx => String(tx.date).startsWith(monthKey) && (selectedAccount === 'all' || tx.accountId === selectedAccount)
          );
          setTransactions(localSubset);
        } else {
          setTransactions(mapped);
        }
      } catch (e: any) {
        if (!alive) return;
        setTransactions([]);
        setError(e?.message || 'Error al cargar transacciones');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [monthKey, selectedAccount, scope]);

  return { transactions, loading, error };
}
