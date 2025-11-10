import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dayjs from "dayjs";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { apiFetch } from "@/lib/http";
import type { Account, Category, Transaction } from "@/lib/types";
import { isBalanceAdjustmentCategory } from "@/lib/utils";
import { convertToUSDByDate } from "@/lib/rates";
import { Loader2 } from "lucide-react";

export function TransactionsCalendar({ selectedAccount }: { selectedAccount?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]); // server-fetched month subset (or fallback)
  const [fallbackLocalTx, setFallbackLocalTx] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [mode, setMode] = useState<'income' | 'expense' | 'balance'>(() => {
    const m = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('calendarMode') : null);
    return (m === 'income' || m === 'expense' || m === 'balance') ? m : 'expense';
  });
  const [scope, setScope] = useState<'all' | 'stats'>(() => {
    const s = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('calendarScope') : null);
    return (s === 'all' || s === 'stats') ? s : 'all';
  });
  const [dailyIncome, setDailyIncome] = useState<Record<string, number>>({});
  const [dailyExpense, setDailyExpense] = useState<Record<string, number>>({});
  const [dailyCountIncome, setDailyCountIncome] = useState<Record<string, number>>({});
  const [dailyCountExpense, setDailyCountExpense] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load base data for accounts and categories; transactions fetched server-side per month
  useEffect(() => {
    const loadBase = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setFallbackLocalTx(TransactionsStore.all());
    };
    loadBase();
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    TransactionsStore.refresh().catch(() => {});
    const off = onDataChange(loadBase);
    return off;
  }, []);

  // Initialize from URL (calendarDate)
  useEffect(() => {
    const fromUrl = searchParams.get('calendarDate');
    if (fromUrl) {
      setSelectedDate(fromUrl);
      const d = dayjs(fromUrl);
      if (d.isValid()) setCurrentMonth(d);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter transactions to current month only
  const monthStart = useMemo(() => currentMonth.startOf('month'), [currentMonth]);
  const monthEnd = useMemo(() => currentMonth.endOf('month'), [currentMonth]);
  const monthKey = useMemo(() => currentMonth.format('YYYY-MM'), [currentMonth]);

  // Fetch transactions for current month from API (includeInStats only when scope==='stats')
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const sp = new URLSearchParams();
        if (scope === 'stats') sp.set('includeInStats','1');
        sp.set('month', currentMonth.format('YYYY-MM'));
        if (selectedAccount && selectedAccount !== 'all') sp.set('accountId', selectedAccount);
        // Do not filter by type here; we need both income and expense for balance & toggling
        const qs = sp.toString();
        const list = await apiFetch<any[]>(`transactions?${qs}`);
        if (!alive) return;
        const mapped: Transaction[] = (list||[]).map(t => {
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

  const monthTx = useMemo(() => transactions, [transactions]);

  // Compute per-day totals in USD (income and expense), excluding balance adjustments; also counts
  useEffect(() => {
    let alive = true;
    (async () => {
      const incomeMap: Record<string, number> = {};
      const expenseMap: Record<string, number> = {};
      const countIncome: Record<string, number> = {};
      const countExpense: Record<string, number> = {};
      for (const tx of monthTx) {
        const cat = categories.find(c => c.id === tx.categoryId);
        if (isBalanceAdjustmentCategory(cat?.name)) continue; // still exclude adjustments
        let usd = tx.amountUsd != null
          ? Number(tx.amountUsd)
          : Number(await convertToUSDByDate(tx.amount, (tx as any).currency, tx.date));
        if (!isFinite(usd)) usd = 0;
        const key = String(tx.date).slice(0,10);
        if (tx.type === 'income') incomeMap[key] = (incomeMap[key] || 0) + usd;
        else if (tx.type === 'expense') expenseMap[key] = (expenseMap[key] || 0) + usd;
        if (tx.type === 'income') countIncome[key] = (countIncome[key] || 0) + 1;
        if (tx.type === 'expense') countExpense[key] = (countExpense[key] || 0) + 1;
      }
      if (alive) { setDailyIncome(incomeMap); setDailyExpense(expenseMap); setDailyCountIncome(countIncome); setDailyCountExpense(countExpense); }
    })();
    return () => { alive = false; };
  }, [monthTx, categories]);

  const dailyTotals = useMemo(() => {
    if (mode === 'income') return dailyIncome;
    if (mode === 'expense') return dailyExpense;
    // balance
    const keys = new Set([...Object.keys(dailyIncome), ...Object.keys(dailyExpense)]);
    const out: Record<string, number> = {};
    keys.forEach(k => { out[k] = (Number(dailyIncome[k] || 0)) - (Number(dailyExpense[k] || 0)); });
    return out;
  }, [mode, dailyIncome, dailyExpense]);

  // Build calendar grid
  const firstDayOfMonth = monthStart.day(); // 0..6 (Sunday..Saturday)
  const daysInMonth = monthStart.daysInMonth();
  const days: Array<{ date: string; totalUsd: number; income: number; expense: number } | null> = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = monthStart.date(d).format('YYYY-MM-DD');
    const raw = dailyTotals[date];
    const totalUsd = typeof raw === 'number' && isFinite(raw) ? raw : 0;
    const inc = Number(dailyIncome[date] || 0);
    const exp = Number(dailyExpense[date] || 0);
    days.push({ date, totalUsd, income: inc, expense: exp });
  }

  const maxIncome = Math.max(0, ...days.map(x => (x ? x.income : 0)));
  const maxExpense = Math.max(0, ...days.map(x => (x ? x.expense : 0)));
  const maxBalanceAbs = Math.max(0, ...days.map(x => (x ? Math.abs((x.income || 0) - (x.expense || 0)) : 0)));
  const colorFor = (item: { totalUsd: number; income: number; expense: number }) => {
    const { income, expense } = item;
    if (mode === 'income') {
      if (income === 0) return '#ffffff';
      const t = Math.max(0, Math.min(1, income / (maxIncome || income)));
      const l = 96 - t * 50;
      return `hsl(160 70% ${l}%)`;
    }
    if (mode === 'expense') {
      if (expense === 0) return '#ffffff';
      const t = Math.max(0, Math.min(1, expense / (maxExpense || expense)));
      const l = 96 - t * 50;
      return `hsl(0 70% ${l}%)`;
    }
    // balance mode
    if (income === 0 && expense === 0) return '#ffffff';
    const bal = income - expense;
    const t = Math.max(0, Math.min(1, Math.abs(bal) / (maxBalanceAbs || Math.abs(bal))));
    const l = 96 - t * 50;
    return bal >= 0 ? `hsl(160 70% ${l}%)` : `hsl(0 70% ${l}%)`;
  };

  const selectedDayTx = useMemo(() => {
    if (!selectedDate) return [] as Transaction[];
    const sameDay = monthTx.filter(tx => String(tx.date).slice(0,10) === selectedDate);
    if (mode === 'income') return sameDay.filter(tx => tx.type === 'income');
    if (mode === 'expense') return sameDay.filter(tx => tx.type === 'expense');
    return sameDay; // balance shows both
  }, [selectedDate, monthTx, mode]);

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

      {/* Mode & Scope switches */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <div>
          <Tabs value={mode} onValueChange={(v) => {
            setMode(v as any);
            const next = new URLSearchParams(searchParams);
              next.set('page','transactions');
              next.set('transactionsView','calendar');
              next.set('calendarMode', v);
              next.set('calendarScope', scope);
              if (selectedDate) next.set('calendarDate', selectedDate);
              setSearchParams(next,{ replace:false });
          }}>
            <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <Tabs value={scope} onValueChange={(v) => {
            setScope(v as any);
            const next = new URLSearchParams(searchParams);
              next.set('page','transactions');
              next.set('transactionsView','calendar');
              next.set('calendarMode', mode);
              next.set('calendarScope', v);
              if (selectedDate) next.set('calendarDate', selectedDate);
              setSearchParams(next,{ replace:false });
          }}>
            <TabsList className="grid grid-cols-2 w-full md:w-auto md:inline-grid">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stats">Stats Only</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mx-auto max-w-[820px]">
        {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((w, i) => (
          <div key={i} className="text-[10px] sm:text-xs text-muted-foreground text-center">{w}</div>
        ))}
        {days.map((item, idx) => item ? (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`w-full h-8 sm:h-10 rounded-md border ${selectedDate === item.date ? 'ring-2 ring-primary/60' : ''}`}
                  style={{ backgroundColor: colorFor(item), borderColor: 'hsl(var(--border))' }}
                  onClick={() => {
                    setSelectedDate(item.date);
                    const next = new URLSearchParams(searchParams);
                    next.set('page', 'transactions');
                    next.set('transactionsView', 'calendar');
                    next.set('calendarDate', item.date);
                    next.set('calendarMode', mode);
                    next.set('calendarScope', scope);
                    setSearchParams(next, { replace: false });
                  }}
                  title={item.date}
                >
                  <div className="text-[10px] sm:text-xs text-foreground/80 px-1 pt-0.5 text-right">{dayjs(item.date).date()}</div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {(() => {
                  const dateKey = item.date;
                  const inc = Number(dailyIncome[dateKey] || 0);
                  const exp = Number(dailyExpense[dateKey] || 0);
                  const cntInc = dailyCountIncome[dateKey] || 0;
                  const cntExp = dailyCountExpense[dateKey] || 0;
                  const bal = inc - exp;
                  return (
                    <div className="space-y-1 min-w-[170px]">
                      <div className="text-xs font-semibold">{dayjs(dateKey).format('ddd, MMM D')}</div>
                      <div className="text-xs flex justify-between"><span>Ingresos:</span><span className="font-medium">${inc.toFixed(2)} <span className="text-muted-foreground">({cntInc})</span></span></div>
                      <div className="text-xs flex justify-between"><span>Gastos:</span><span className="font-medium">${exp.toFixed(2)} <span className="text-muted-foreground">({cntExp})</span></span></div>
                      <div className="text-xs flex justify-between"><span>Balance:</span><span className="font-medium">${bal.toFixed(2)}</span></div>
                    </div>
                  );
                })()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div key={idx} />
        ))}
      </div>

      {/* Loading / Error / Empty states */}
      <div className="mt-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Cargando transacciones...</div>
        )}
        {!loading && error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && transactions.length === 0 && (
          <div className="text-sm text-muted-foreground">No hay datos para este mes (modo/alcance).</div>
        )}
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
              selectedDayTx.map(tx => {
                const amountColor = (() => {
                  if (tx.type === 'income') return 'text-green-600';
                  if (tx.type === 'expense') return 'text-red-600';
                  return '';
                })();
                // In income/expense modes we only show one type already; still color explicitly
                // In balance mode we show both types with their colors
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
                    <div className="text-sm font-medium truncate">{tx.description}</div>
                    <div className={`text-sm font-semibold ${amountColor}`}>
                      {tx.type === 'expense' ? '-' : '+'}${Number(tx.amountUsd ?? tx.amount ?? 0).toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
