import { useEffect, useState } from "react";
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

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const sp = new URLSearchParams();
        if (scope === 'stats') sp.set('includeInStats', '1');
        sp.set('month', currentMonth.format('YYYY-MM'));
        if (selectedAccount && selectedAccount !== 'all') sp.set('accountId', selectedAccount);
        // Do not filter by type here; we need both income and expense for balance & toggling
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
          // Fallback to local store data
          const monthPrefix = currentMonth.format('YYYY-MM');
          const localSubset = fallbackLocalTx.filter(tx => String(tx.date).startsWith(monthPrefix) && (selectedAccount === 'all' || tx.accountId === selectedAccount));
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
  }, [currentMonth.format('YYYY-MM'), selectedAccount, scope, fallbackLocalTx]);

  return { transactions, loading, error };
}
