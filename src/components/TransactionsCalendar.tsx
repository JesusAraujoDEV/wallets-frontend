import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dayjs from "dayjs";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import type { Account, Category, Transaction } from "@/lib/types";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import { convertToUSDByDate } from "@/lib/rates";

export function TransactionsCalendar({ selectedAccount }: { selectedAccount?: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [mode, setMode] = useState<'income' | 'expense' | 'balance'>('expense');
  const [dailyIncome, setDailyIncome] = useState<Record<string, number>>({});
  const [dailyExpense, setDailyExpense] = useState<Record<string, number>>({});

  // Load base data
  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setTransactions(TransactionsStore.all());
    };
    load();
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    TransactionsStore.refresh().catch(() => {});
    const off = onDataChange(load);
    return off;
  }, []);

  // Filter transactions to current month only
  const monthStart = useMemo(() => currentMonth.startOf('month'), [currentMonth]);
  const monthEnd = useMemo(() => currentMonth.endOf('month'), [currentMonth]);
  const monthKey = useMemo(() => currentMonth.format('YYYY-MM'), [currentMonth]);

  const monthTx = useMemo(() => {
    return transactions.filter(tx => {
      if (selectedAccount && selectedAccount !== 'all' && tx.accountId !== selectedAccount) return false;
      const d = dayjs(String(tx.date).slice(0,10));
      return d.isValid() && d.isAfter(monthStart.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'));
    });
  }, [transactions, monthStart, monthEnd, selectedAccount]);

  // Compute per-day totals in USD (income and expense), excluding balance adjustments and honoring includeInStats=true
  useEffect(() => {
    let alive = true;
    (async () => {
      const incomeMap: Record<string, number> = {};
      const expenseMap: Record<string, number> = {};
      for (const tx of monthTx) {
        const cat = categories.find(c => c.id === tx.categoryId);
        if (isBalanceAdjustmentCategory(cat?.name)) continue;
        if (cat && cat.includeInStats === false) continue;
        const usd = tx.amountUsd != null
          ? tx.amountUsd
          : (await convertToUSDByDate(tx.amount, (tx as any).currency, tx.date)) ?? 0;
        const key = String(tx.date).slice(0,10);
        if (tx.type === 'income') incomeMap[key] = (incomeMap[key] || 0) + usd;
        else if (tx.type === 'expense') expenseMap[key] = (expenseMap[key] || 0) + usd;
      }
      if (alive) { setDailyIncome(incomeMap); setDailyExpense(expenseMap); }
    })();
    return () => { alive = false; };
  }, [monthTx, categories]);

  const dailyTotals = useMemo(() => {
    if (mode === 'income') return dailyIncome;
    if (mode === 'expense') return dailyExpense;
    // balance
    const keys = new Set([...Object.keys(dailyIncome), ...Object.keys(dailyExpense)]);
    const out: Record<string, number> = {};
    keys.forEach(k => { out[k] = (dailyIncome[k] || 0) - (dailyExpense[k] || 0); });
    return out;
  }, [mode, dailyIncome, dailyExpense]);

  // Build calendar grid
  const firstDayOfMonth = monthStart.day(); // 0..6 (Sunday..Saturday)
  const daysInMonth = monthStart.daysInMonth();
  const days: Array<{ date: string; totalUsd: number } | null> = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = monthStart.date(d).format('YYYY-MM-DD');
    const raw = dailyTotals[date];
    const totalUsd = typeof raw === 'number' && isFinite(raw) ? raw : 0;
    days.push({ date, totalUsd });
  }

  const maxAbs = Math.max(0, ...days.map(x => (x && typeof x.totalUsd === 'number' ? Math.abs(x.totalUsd) : 0)));
  const colorFor = (v: number) => {
    // Distinct coloring for balance (diverging), otherwise green scale
    if (mode === 'balance') {
      if (maxAbs <= 0) return 'hsl(var(--muted))';
      const t = Math.max(0, Math.min(1, Math.abs(v) / maxAbs));
      const l = 96 - t * 50;
      if (v >= 0) {
        // green for positive balance
        return `hsl(160 70% ${l}%)`;
      } else {
        // red for negative balance
        return `hsl(0 70% ${l}%)`;
      }
    }
    const max = Math.max(0, ...days.map(x => (x && typeof x.totalUsd === 'number' ? x.totalUsd : 0)));
    if (max <= 0) return 'hsl(var(--muted))';
    const t = Math.max(0, Math.min(1, v / max));
    const l = 96 - t * 50;
    return `hsl(160 70% ${l}%)`;
  };

  const selectedDayTx = useMemo(() => {
    if (!selectedDate) return [] as Transaction[];
    return monthTx.filter(tx => String(tx.date).slice(0,10) === selectedDate);
  }, [selectedDate, monthTx]);

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
        <h3 className="text-xl font-semibold w-full sm:w-auto">Calendario</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-sm font-medium w-36 text-center">{currentMonth.format('MMMM YYYY')}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(dayjs())}>Hoy</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(m => m.add(1, 'month'))}>Siguiente</Button>
          </div>
        </div>
      </div>

      {/* Mode switch: income | expense | balance */}
      <div className="mb-3">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((w, i) => (
          <div key={i} className="text-xs sm:text-sm text-muted-foreground text-center">{w}</div>
        ))}
        {days.map((item, idx) => item ? (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="aspect-square w-full rounded-md border"
                  style={{ backgroundColor: colorFor(item.totalUsd), borderColor: 'hsl(var(--border))' }}
                  onClick={() => setSelectedDate(item.date)}
                  title={item.date}
                >
                  <div className="text-[10px] sm:text-xs text-foreground/80 p-1 text-right">{dayjs(item.date).date()}</div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {mode === 'income' ? (
                  <>Ingresos: ${Number(item.totalUsd || 0).toFixed(2)}</>
                ) : mode === 'expense' ? (
                  <>Gastado: ${Number(item.totalUsd || 0).toFixed(2)}</>
                ) : (
                  <>Balance: ${Number(item.totalUsd || 0).toFixed(2)}</>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div key={idx} />
        ))}
      </div>

      {/* Selected day transactions */}
      {selectedDate ? (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold">{dayjs(selectedDate).format('dddd, MMM D, YYYY')}</h4>
            <div className="text-sm text-muted-foreground">Total: ${Number(dailyTotals[selectedDate] || 0).toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            {selectedDayTx.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay transacciones ese día.</div>
            ) : (
              selectedDayTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                  <div className="text-sm font-medium truncate">{tx.description}</div>
                  <div className="text-sm font-semibold">{tx.type === 'expense' ? '-' : '+'}${(tx.amountUsd ?? tx.amount).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
