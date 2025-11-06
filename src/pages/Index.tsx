import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { KPICard } from "@/components/KPICard";
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
import { TransactionsList } from "@/components/TransactionsList";
import { TransactionsCalendar } from "../components/TransactionsCalendar";
import { CategoryManager } from "@/components/CategoryManager";
import { AccountManager } from "@/components/AccountManager";
import { AccountSelector } from "@/components/AccountSelector";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// No import/export UI; data persistence handled via storage functions
import { useSearchParams } from "react-router-dom";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { AuthApi, type AuthUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useVESExchangeRate, convertToUSD } from "@/lib/rates";
import { fetchIncomeSummary, fetchExpenseSummary, fetchBalanceSummary, fetchGlobalBalance, fetchIncomeMonthly, fetchExpenseMonthly } from "@/lib/summary";
import { isBalanceAdjustmentCategory, isBalanceAdjustmentPlus } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/lib/types";
import { fetchNetCashFlow, fetchSpendingHeatmap, fetchExpenseVolatility, fetchComparativeMoM, fetchMonthlyForecast, fetchIncomeHeatmap, fetchIncomeVolatility, fetchComparativeMoMIncome } from "@/lib/stats";

// Dashboard data is derived from localStorage (JSON DB)

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedIncomeCats, setSelectedIncomeCats] = useState<string[]>([]);
  const [selectedExpenseCats, setSelectedExpenseCats] = useState<string[]>([]);
  const { rate } = useVESExchangeRate();
  const [statsScope, setStatsScope] = useState<"all" | "only" | "exclude">("all");
  const [kpiIncome, setKpiIncome] = useState<number>(0);
  const [kpiExpenses, setKpiExpenses] = useState<number>(0);
  const [kpiNet, setKpiNet] = useState<number>(0);
  const [totalBalanceUsd, setTotalBalanceUsd] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const allowedPages = useMemo(() => new Set(["dashboard", "transactions", "categories", "accounts"]), []);
  const pageFromUrl = searchParams.get("page") || "";
  const normalizedPage = pageFromUrl.toLowerCase();
  const currentPage = allowedPages.has(normalizedPage) ? normalizedPage : "dashboard";

  // Ensure the URL always contains a valid ?page=<value>
  useEffect(() => {
    if (!allowedPages.has(normalizedPage)) {
      const next = new URLSearchParams(searchParams);
      next.set("page", "dashboard");
      // Replace to avoid adding an extra history entry on first load
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
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

  // Fetch current user for header title
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await AuthApi.me();
        if (alive) setAuthUser(u);
      } catch {
        // ignore; RequireAuth handles redirect when not authenticated
      }
    })();
    return () => { alive = false; };
  }, []);
  
  // Fetch Total Balance from API (global accounts total in USD)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const b = await fetchGlobalBalance();
        if (!alive) return;
        setTotalBalanceUsd(b.accounts_total_usd ?? 0);
      } catch {
        if (!alive) return;
        setTotalBalanceUsd(0);
      }
    })();
    return () => { alive = false; };
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

  useEffect(() => {
    let alive = true;
    const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const dateTo = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
    const include: true = true;
    const accountIds = selectedAccount !== 'all' ? [selectedAccount] : undefined;
    (async () => {
      try {
        const [inc, exp, net] = await Promise.all([
          fetchIncomeSummary({ month: monthKey, includeInStats: include, accountIds }),
          fetchExpenseSummary({ month: monthKey, includeInStats: include, accountIds }),
          fetchBalanceSummary({ month: monthKey, includeInStats: include, accountIds })
        ]);
        if (!alive) return;
        setKpiIncome(inc || 0);
        setKpiExpenses(exp || 0);
        setKpiNet(net || (inc || 0) - (exp || 0));
      } catch (e) {
        if (!alive) return;
        setKpiIncome(0); setKpiExpenses(0); setKpiNet(0);
      }
    })();
    return () => { alive = false; };
  }, [monthKey, selectedAccount]);

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
            <h1 className="text-3xl font-bold text-foreground">{authUser?.username ? `${authUser.username}'s Financial Dashboard` : 'Financial Dashboard'}</h1>
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

      <main className="container mx-auto px-4 py-8">
        {/* Persistence uses localStorage via helper functions; no import/export UI */}
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Balance (USD)"
            value={`$${totalBalanceUsd.toFixed(2)}`}
            icon={Wallet}
            trend={{ value: "", isPositive: true }}
            colorScheme="primary"
          />
          <KPICard
            title="Monthly Income (USD)"
            value={`$${kpiIncome.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: "", isPositive: true }}
            colorScheme="secondary"
          />
          <KPICard
            title="Monthly Expenses (USD)"
            value={`$${kpiExpenses.toFixed(2)}`}
            icon={TrendingDown}
            trend={{ value: "", isPositive: false }}
            colorScheme="accent"
          />
        </div>

        {/* Main Content with Tabs */}
        <Tabs
          value={currentPage}
          onValueChange={(val) => {
            const next = new URLSearchParams(searchParams);
            next.set("page", val);
            // Push a new history entry so Back works between tabs
            setSearchParams(next, { replace: false });
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AccountSelector 
              selectedAccount={selectedAccount}
              onAccountChange={setSelectedAccount}
            />
            {/* Category scope tabs (affects charts; KPIs stay includeInStats=1) */}
            <div className="mb-4">
              <Tabs value={statsScope} onValueChange={(v) => setStatsScope(v as any)}>
                <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-grid">
                  <TabsTrigger value="all">All categories</TabsTrigger>
                  <TabsTrigger value="only">Only included in stats</TabsTrigger>
                  <TabsTrigger value="exclude">Only excluded in stats</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-muted-foreground mt-2">Tabs and selected Expense categories filter Pie, Budget, Trends y las gráficas avanzadas (Heatmap, Volatility, MoM). Las llamadas al servidor usan includeInStats; además las categorías seleccionadas limitan lo mostrado.</p>
            </div>
            
            {selectedAccount === "all" ? (
              <div className="mb-4 p-4 bg-primary-light/30 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <span className="font-semibold">Global Dashboard View:</span>
                  Showing aggregated data across all accounts
                </p>
              </div>
            ) : (
              <div className="mb-4 p-4 bg-secondary-light/30 rounded-lg border border-secondary/20">
                <p className="text-sm text-foreground flex items-center gap-2">
                  <span className="font-semibold">Account Dashboard View:</span>
                  Showing data for selected account only
                </p>
              </div>
            )}

            {/* Category Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <div>
              <BudgetComparisonChart data={budgetData} />
            </div>

            {/* New Advanced Stats section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NetCashFlowChart summary={netFlowData.summary} data={netFlowData.series} />
              <MonthlyForecastGauge {...forecastData} />
            </div>
            {/* Heatmaps side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingHeatmap {...heatmapData} />
              <IncomeHeatmap {...incomeHeatmapData} />
            </div>
            {/* Volatility charts side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseVolatilityBoxPlot categories={volatilityData} />
              <IncomeVolatilityBoxPlot categories={incomeVolatilityData} />
            </div>
            {/* Comparative MoM (expense then income) */}
            <div>
              {momData?.summary ? (
                <ComparativeMoM summary={momData.summary} categories={momData.categories} />
              ) : null}
            </div>
            <div>
              {incomeMomData?.summary ? (
                <ComparativeMoMIncome summary={incomeMomData.summary} categories={incomeMomData.categories} />
              ) : null}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            {/* Nested tabs for list vs calendar (persist view in URL as transactionsView) */}
            {
              (() => {
                const currentView = searchParams.get('transactionsView') || 'list';
                return (
                  <Tabs value={currentView} onValueChange={(v) => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', 'transactions');
                    next.set('transactionsView', v);
                    setSearchParams(next, { replace: false });
                  }} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-grid">
                      <TabsTrigger value="list">Listado</TabsTrigger>
                      <TabsTrigger value="calendar">Calendario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list">
                      <TransactionsList />
                    </TabsContent>
                    <TabsContent value="calendar">
                      <TransactionsCalendar selectedAccount={selectedAccount} />
                    </TabsContent>
                  </Tabs>
                );
              })()
            }
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <AccountManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

