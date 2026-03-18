import { useEffect, useMemo, useState } from "react";
import { DashboardStats } from "@/components/DashboardStats";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { NetCashFlowChart } from "@/components/NetCashFlowChart";
import { SpendingHeatmap } from "@/components/SpendingHeatmap";
import { IncomeHeatmap } from "@/components/IncomeHeatmap";
import { ExpenseVolatilityBoxPlot } from "@/components/ExpenseVolatilityBoxPlot";
import { IncomeVolatilityBoxPlot } from "@/components/IncomeVolatilityBoxPlot";
import { ComparativeMoM } from "@/components/ComparativeMoM";
import { ComparativeMoMIncome } from "@/components/ComparativeMoMIncome";
import { MonthlyForecastGauge } from "@/components/MonthlyForecastGauge";
import { TrendLineChart } from "@/components/TrendLineChart";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";
import { AccountSelector } from "@/components/AccountSelector";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthApi } from "@/lib/auth";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { useVESExchangeRate, convertToUSD } from "@/lib/rates";
import { fetchIncomeMonthly, fetchExpenseMonthly, fetchGlobalBalance, type GlobalBalance } from "@/lib/summary";
import { isBalanceAdjustmentCategory, isBalanceAdjustmentPlus } from "@/lib/utils";
import type { Account, Category, Transaction, AuthUser } from "@/lib/types";
import { fetchNetCashFlow, fetchSpendingHeatmap, fetchExpenseVolatility, fetchComparativeMoM, fetchMonthlyForecast, fetchIncomeHeatmap, fetchIncomeVolatility, fetchComparativeMoMIncome } from "@/lib/stats";
import { useNavigate } from "react-router-dom";

// Dashboard data is derived from localStorage (JSON DB)

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedIncomeCats, setSelectedIncomeCats] = useState<string[]>([]);
  const [selectedExpenseCats, setSelectedExpenseCats] = useState<string[]>([]);
  const navigate = useNavigate();
  const { rate } = useVESExchangeRate();
  const [statsScope, setStatsScope] = useState<"all" | "only" | "exclude">("all");
  // New stats datasets
  const [netFlowData, setNetFlowData] = useState<{ summary?: any; series: any[] }>({ summary: undefined, series: [] });
  const [heatmapData, setHeatmapData] = useState<{ categories: string[]; weekdays: string[]; data_points: any[] }>({ categories: [], weekdays: [], data_points: [] });
  const [volatilityData, setVolatilityData] = useState<any[]>([]);
  const [momData, setMomData] = useState<{ summary: any; categories: any[] }>({ summary: { current_total: 0, total_delta_percent: 0, total_delta_usd: 0 }, categories: [] });
  // Income counterparts
  const [incomeHeatmapData, setIncomeHeatmapData] = useState<{ categories: string[]; weekdays: string[]; data_points: any[] }>({ categories: [], weekdays: [], data_points: [] });
  const [incomeVolatilityData, setIncomeVolatilityData] = useState<any[]>([]);
  const [incomeMomData, setIncomeMomData] = useState<{ summary: any; categories: any[] }>({ summary: { current_total: 0, total_delta_percent: 0, total_delta_usd: 0 }, categories: [] });
  const [forecastData, setForecastData] = useState<{ budget_total: number; current_spending_mtd: number; projected_total_spending: number; projected_over_under: number }>({ budget_total: 0, current_spending_mtd: 0, projected_total_spending: 0, projected_over_under: 0 });
  const [balanceSummary, setBalanceSummary] = useState<GlobalBalance | null>(null);

  // Load JSON DB contents and subscribe to changes
  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setTransactions(TransactionsStore.all());
    };
    // initial
    load();
    // background refresh
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    TransactionsStore.refresh().catch(() => {});
    const off = onDataChange(load);
    return off;
  }, []);

  // Restore persisted category filters once categories are loaded
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dashboard.categoryFilters");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { income: string[]; expense: string[] } | null;
      if (!parsed) return;
      const catIds = new Set(categories.map((c) => c.id));
      setSelectedIncomeCats((parsed.income || []).filter((id) => catIds.has(id)));
      setSelectedExpenseCats((parsed.expense || []).filter((id) => catIds.has(id)));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  // Persist filters
  useEffect(() => {
    const payload = JSON.stringify({ income: selectedIncomeCats, expense: selectedExpenseCats });
    localStorage.setItem("dashboard.categoryFilters", payload);
  }, [selectedIncomeCats, selectedExpenseCats]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await AuthApi.me();
        if (alive) setAuthUser(response.user);
      } catch {
        if (alive) setAuthUser(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentMonth = (iso: string) => {
    const d = new Date(iso);
    return d >= firstOfMonth && d <= now;
  };
  const txByAccount = useMemo(() => (
    transactions.filter(t => selectedAccount === "all" || t.accountId === selectedAccount)
  ), [transactions, selectedAccount]);

  const incomeFilterSet = useMemo(() => new Set(selectedIncomeCats), [selectedIncomeCats]);
  const expenseFilterSet = useMemo(() => new Set(selectedExpenseCats), [selectedExpenseCats]);
  const incomeCategories = useMemo(() => categories.filter(c => c.type === "income"), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === "expense"), [categories]);
  const visibleIncomeCategories = useMemo(() => {
    return incomeCategories.filter(c => {
      if (statsScope === "only") return c.includeInStats === true;
      if (statsScope === "exclude") return c.includeInStats === false;
      return true;
    });
  }, [incomeCategories, statsScope]);
  const visibleExpenseCategories = useMemo(() => {
    return expenseCategories.filter(c => {
      if (statsScope === "only") return c.includeInStats === true;
      if (statsScope === "exclude") return c.includeInStats === false;
      return true;
    });
  }, [expenseCategories, statsScope]);
  const visibleExpenseCategoryNames = useMemo(() => new Set(visibleExpenseCategories.map(c => c.name)), [visibleExpenseCategories]);
  const visibleIncomeCategoryNames = useMemo(() => new Set(visibleIncomeCategories.map(c => c.name)), [visibleIncomeCategories]);
  const selectedExpenseCategoryNames = useMemo(() => {
    if (!selectedExpenseCats.length) return new Set<string>();
    const names = categories
      .filter(c => c.type === 'expense' && selectedExpenseCats.includes(c.id))
      .map(c => c.name);
    return new Set(names);
  }, [categories, selectedExpenseCats]);
  const selectedIncomeCategoryNames = useMemo(() => {
    if (!selectedIncomeCats.length) return new Set<string>();
    const names = categories
      .filter(c => c.type === 'income' && selectedIncomeCats.includes(c.id))
      .map(c => c.name);
    return new Set(names);
  }, [categories, selectedIncomeCats]);

  // Current month range and month key
  const monthKey = useMemo(() => {
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${y}-${m}`;
  }, [now]);

  // Charts
  const expensePieData = useMemo(() => {
    const expTx = txByAccount
      .filter(t => t.type === "expense" && isCurrentMonth(t.date))
      .filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        // Exclude balance adjustment categories
        if (isBalanceAdjustmentCategory(cat?.name)) return false;
        // Apply statsScope filtering by category.includeInStats
        if (statsScope === "only") return cat?.includeInStats === true;
        if (statsScope === "exclude") return cat?.includeInStats === false;
        return true; // all
      })
      .filter(t => (selectedExpenseCats.length > 0 ? expenseFilterSet.has(t.categoryId) : true));
    const map = new Map<string, number>();
    for (const t of expTx) {
      const acc = accounts.find(a => a.id === t.accountId);
      const cur = acc?.currency ?? "USD";
      const usd = convertToUSD(t.amount, cur as any, rate || null) ?? 0;
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + usd);
    }
    return Array.from(map.entries()).map(([categoryId, amount]) => {
      const cat = categories.find(c => c.id === categoryId);
      return {
        id: categoryId,
        category: cat?.name || "Uncategorized",
        amount,
        color: cat?.color || "hsl(var(--chart-6))",
      };
    });
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedExpenseCats.length, statsScope]);

  const [trendData, setTrendData] = useState<{ month: string; income: number; expenses: number }[]>([]);

  useEffect(() => {
    let alive = true;
    const accountIds = selectedAccount !== "all" ? [selectedAccount] : undefined;
    (async () => {
      try {
        const summary = await fetchGlobalBalance({ month: monthKey, accountIds });
        if (!alive) return;
        setBalanceSummary(summary);
      } catch {
        if (!alive) return;
        setBalanceSummary(null);
      }
    })();
    return () => { alive = false; };
  }, [monthKey, selectedAccount]);

  useEffect(() => {
    let alive = true;
    // Build the last 6 months range including current month
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const fromMonth = fmt(start);
    const toMonth = fmt(end);
    const monthsKeys: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      monthsKeys.push(fmt(d));
    }
    const monthLabel = (ym: string) => {
      const [y, m] = ym.split('-').map(Number);
      const d = new Date(y, (m || 1) - 1, 1);
      return d.toLocaleString(undefined, { month: 'short' });
    };
    const accountIds = selectedAccount !== 'all' ? [selectedAccount] : undefined;
    const includeParam = statsScope === 'only' ? true : statsScope === 'exclude' ? false : undefined;
    const visibleIncomeSet = new Set(visibleIncomeCategories.map(c => c.id));
    const visibleExpenseSet = new Set(visibleExpenseCategories.map(c => c.id));
    const incomeCategoryIds = (selectedIncomeCats && selectedIncomeCats.length)
      ? selectedIncomeCats.filter(id => visibleIncomeSet.has(id))
      : undefined;
    const expenseCategoryIds = (selectedExpenseCats && selectedExpenseCats.length)
      ? selectedExpenseCats.filter(id => visibleExpenseSet.has(id))
      : undefined;
    (async () => {
      try {
        const [incSeries, expSeries] = await Promise.all([
          fetchIncomeMonthly({ fromMonth, toMonth, includeInStats: includeParam, accountIds, categoryIds: incomeCategoryIds }),
          fetchExpenseMonthly({ fromMonth, toMonth, includeInStats: includeParam, accountIds, categoryIds: expenseCategoryIds }),
        ]);
        if (!alive) return;
        const data = monthsKeys.map((k) => ({
          month: monthLabel(k),
          income: Number(incSeries[k] || 0),
          expenses: Number(expSeries[k] || 0),
        }));
        setTrendData(data);
      } catch {
        if (!alive) return;
        setTrendData(monthsKeys.map(k => ({ month: monthLabel(k), income: 0, expenses: 0 })));
      }
    })();
    return () => { alive = false; };
  }, [selectedAccount, selectedIncomeCats.join(','), selectedExpenseCats.join(','), visibleIncomeCategories.length, visibleExpenseCategories.length, statsScope]);

  // Fetch new stats datasets
  useEffect(() => {
    let alive = true;
    const includeParam = statsScope === 'only' ? true : statsScope === 'exclude' ? false : undefined;
    const accountId = selectedAccount !== 'all' ? selectedAccount : undefined;
    // last 6 months range -> convert to from_date/to_date (YYYY-MM-DD)
    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const firstOfStart = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    const lastOfEnd = new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0);
    const fromDate = firstOfStart.toISOString().slice(0, 10);
    const toDate = lastOfEnd.toISOString().slice(0, 10);
    (async () => {
      try {
        const [net, heat, vol, mom, fc, incHeat, incVol, incMom] = await Promise.all([
          fetchNetCashFlow({ includeInStats: includeParam, accountId, fromDate, toDate, timeUnit: 'month' }),
          fetchSpendingHeatmap({ includeInStats: includeParam, accountId, fromDate, toDate }),
          fetchExpenseVolatility({ includeInStats: includeParam, accountId, fromDate, toDate, topN: 8 }),
          fetchComparativeMoM({ includeInStats: includeParam, accountId, date: toDate }),
          fetchMonthlyForecast({ includeInStats: includeParam, accountId, date: now.toISOString().slice(0,10) }),
          fetchIncomeHeatmap({ includeInStats: includeParam, accountId, fromDate, toDate }),
          fetchIncomeVolatility({ includeInStats: includeParam, accountId, fromDate, toDate, topN: 8 }),
          fetchComparativeMoMIncome({ includeInStats: includeParam, accountId, date: toDate }),
        ]);
        if (!alive) return;
        setNetFlowData({ summary: net?.summary, series: net?.time_series || [] });

        // Ensure category-scoped charts reflect the includeInStats tab strictly, even if backend returns broader sets
        // 1) Spending Heatmap: filter categories and reindex data_points
        const rawHeatCategories = heat?.categories || [];
        const rawHeatWeekdays = heat?.weekdays || [];
        const rawHeatPoints = heat?.data_points || [];
        const allowedName = (name: string) => {
          // Respect includeInStats scope
          if (statsScope !== 'all' && !visibleExpenseCategoryNames.has(name)) return false;
          // Also respect explicit selected categories (if any)
          if (selectedExpenseCategoryNames.size > 0 && !selectedExpenseCategoryNames.has(name)) return false;
          return true;
        };
        const oldIdxToNew = new Map<number, number>();
        const filteredHeatCategories: string[] = [];
        rawHeatCategories.forEach((name, idx) => {
          if (allowedName(name)) {
            oldIdxToNew.set(idx, filteredHeatCategories.length);
            filteredHeatCategories.push(name);
          }
        });
        const filteredHeatPoints = rawHeatPoints
          .filter(p => oldIdxToNew.has(p.category_idx))
          .map(p => ({ ...p, category_idx: oldIdxToNew.get(p.category_idx)! }));
        setHeatmapData({ categories: filteredHeatCategories, weekdays: rawHeatWeekdays, data_points: filteredHeatPoints });

        // 2) Expense Volatility: filter by category name
  const rawVolCats = vol?.categories_data || [];
  const filteredVolCats = rawVolCats.filter(c => allowedName(c.category));
        setVolatilityData(filteredVolCats);

        // 3) Comparative MoM: filter categories_comparison by category name
  const rawMomSummary = mom?.summary || { current_total: 0, total_delta_percent: 0, total_delta_usd: 0 };
  const rawMomCats = mom?.categories_comparison || [];
  const filteredMomCats = rawMomCats.filter(c => allowedName(c.category));
        setMomData({ summary: rawMomSummary, categories: filteredMomCats });

        setForecastData(fc || { budget_total: 0, current_spending_mtd: 0, projected_total_spending: 0, projected_over_under: 0 });

        // Income charts filtering
        const rawIncHeatCategories = incHeat?.categories || [];
        const rawIncHeatWeekdays = incHeat?.weekdays || [];
        const rawIncHeatPoints = incHeat?.data_points || [];
        const allowedIncome = (name: string) => {
          if (statsScope !== 'all' && !visibleIncomeCategoryNames.has(name)) return false;
          if (selectedIncomeCategoryNames.size > 0 && !selectedIncomeCategoryNames.has(name)) return false;
          return true;
        };
        const incOldIdxToNew = new Map<number, number>();
        const filteredIncHeatCategories: string[] = [];
        rawIncHeatCategories.forEach((name, idx) => {
          if (allowedIncome(name)) {
            incOldIdxToNew.set(idx, filteredIncHeatCategories.length);
            filteredIncHeatCategories.push(name);
          }
        });
        const filteredIncHeatPoints = rawIncHeatPoints
          .filter(p => incOldIdxToNew.has(p.category_idx))
          .map(p => ({ ...p, category_idx: incOldIdxToNew.get(p.category_idx)! }));
        setIncomeHeatmapData({ categories: filteredIncHeatCategories, weekdays: rawIncHeatWeekdays, data_points: filteredIncHeatPoints });

        const rawIncVolCats = incVol?.categories_data || [];
        const filteredIncVolCats = rawIncVolCats.filter(c => allowedIncome(c.category));
        setIncomeVolatilityData(filteredIncVolCats);

        const rawIncMomSummary = incMom?.summary || { current_total: 0, total_delta_percent: 0, total_delta_usd: 0 };
        const rawIncMomCats = incMom?.categories_comparison || [];
        const filteredIncMomCats = rawIncMomCats.filter(c => allowedIncome(c.category));
        setIncomeMomData({ summary: rawIncMomSummary, categories: filteredIncMomCats });
      } catch (err) {
        // swallow but keep alive check
        if (!alive) return;
        console.warn('stats fetch failed', err);
      }
    })();
    return () => { alive = false; };
  }, [statsScope, selectedAccount, monthKey, visibleExpenseCategoryNames, selectedExpenseCats.join(','), visibleIncomeCategoryNames, selectedIncomeCats.join(','), categories.length]);

  const budgetData = useMemo(() => {
    // Placeholder budgets (0) with actual monthly expenses per category
    const expTx = txByAccount
      .filter(t => t.type === "expense" && isCurrentMonth(t.date))
      .filter(t => {
        const cat = categories.find(c => c.id === t.categoryId);
        if (isBalanceAdjustmentCategory(cat?.name)) return false;
        if (statsScope === "only") return cat?.includeInStats === true;
        if (statsScope === "exclude") return cat?.includeInStats === false;
        return true;
      })
      .filter(t => (selectedExpenseCats.length > 0 ? expenseFilterSet.has(t.categoryId) : true));
    const map = new Map<string, number>();
    for (const t of expTx) {
      const acc = accounts.find(a => a.id === t.accountId);
      const cur = acc?.currency ?? "USD";
      const usd = convertToUSD(t.amount, cur as any, rate || null) ?? 0;
      map.set(t.categoryId, (map.get(t.categoryId) || 0) + usd);
    }
    return Array.from(map.entries()).map(([categoryId, actual]) => {
      const cat = categories.find(c => c.id === categoryId);
      return { category: cat?.name || "Uncategorized", budget: 0, actual };
    });
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedExpenseCats.length, statsScope]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{authUser?.username ? `${authUser.username} Dashboard` : "Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">Track your finances with clarity</p>
          </div>
          <button
            className="h-9 rounded-md border px-3 text-sm hover:bg-accent"
            onClick={async () => { await AuthApi.logout(); navigate('/login', { replace: true }); }}
            title="Cerrar sesión"
          >
            Logout
          </button>
        </div>
      </header>

      <DashboardStats transactions={txByAccount} accounts={accounts} rate={rate} balanceSummary={balanceSummary} />

      <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <AccountSelector selectedAccount={selectedAccount} onAccountChange={setSelectedAccount} />

        <div className="space-y-2">
          <Tabs value={statsScope} onValueChange={(value) => setStatsScope(value as typeof statsScope)}>
            <TabsList className="grid w-full grid-cols-1 gap-2 bg-transparent p-0 md:inline-grid md:w-auto md:grid-cols-3">
              <TabsTrigger value="all">All categories</TabsTrigger>
              <TabsTrigger value="only">Only included in stats</TabsTrigger>
              <TabsTrigger value="exclude">Only excluded in stats</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs text-slate-500">
            Tabs and selected categories filter pie, budget, trends and advanced charts. Server calls still respect the backend includeInStats contract.
          </p>
        </div>

        {selectedAccount === "all" ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="font-semibold">Global Dashboard View:</span> Showing aggregated data across all accounts.
          </div>
        ) : (
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            <span className="font-semibold">Account Dashboard View:</span> Showing data for the selected account only.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CategoryMultiSelect
            label="Elegir categorías Income"
            categories={visibleIncomeCategories}
            selected={selectedIncomeCats}
            onChange={setSelectedIncomeCats}
            placeholder="Todas las categorías de Income"
          />
          <CategoryMultiSelect
            label="Elegir categorías Expense"
            categories={visibleExpenseCategories}
            selected={selectedExpenseCats}
            onChange={setSelectedExpenseCats}
            placeholder="Todas las categorías de Expense"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExpensePieChart
            data={expensePieData}
            onSliceClick={(catId) => {
              if (!catId) return;
              setSelectedExpenseCats((prev) => {
                const set = new Set(prev);
                if (set.has(catId)) {
                  return prev.filter((x) => x !== catId);
                }
                return [...prev, catId];
              });
            }}
          />
          <TrendLineChart data={trendData} />
        </div>

        <BudgetComparisonChart data={budgetData} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NetCashFlowChart summary={netFlowData.summary} data={netFlowData.series} />
          <MonthlyForecastGauge {...forecastData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpendingHeatmap {...heatmapData} />
          <IncomeHeatmap {...incomeHeatmapData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ExpenseVolatilityBoxPlot categories={volatilityData} />
          <IncomeVolatilityBoxPlot categories={incomeVolatilityData} />
        </div>

        {momData?.summary ? <ComparativeMoM summary={momData.summary} categories={momData.categories} /> : null}
        {incomeMomData?.summary ? <ComparativeMoMIncome summary={incomeMomData.summary} categories={incomeMomData.categories} /> : null}
      </section>
    </div>
  );
};

export default Index;

