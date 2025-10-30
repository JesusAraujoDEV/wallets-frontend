import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { TrendLineChart } from "@/components/TrendLineChart";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";
import { TransactionsList } from "@/components/TransactionsList";
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
import { fetchIncomeSummary, fetchExpenseSummary, fetchBalanceSummary, fetchGlobalBalance } from "@/lib/summary";
import { isBalanceAdjustmentCategory, isBalanceAdjustmentPlus } from "@/lib/utils";
import type { Account, Category, Transaction } from "@/lib/types";

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
    const include = statsScope === 'only' ? true : statsScope === 'exclude' ? false : undefined;
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
  }, [now, monthKey, statsScope, selectedAccount]);

  // Charts
  const expensePieData = useMemo(() => {
    const expTx = txByAccount.filter(t => t.type === "expense" && isCurrentMonth(t.date)).filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return !isBalanceAdjustmentCategory(cat?.name);
    }).filter(t => selectedExpenseCats.length > 0 ? expenseFilterSet.has(t.categoryId) : true);
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
        category: cat?.name || "Uncategorized",
        amount,
        color: cat?.color || "hsl(var(--chart-6))",
      };
    });
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedExpenseCats.length]);

  const trendData = useMemo(() => {
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const out: { month: string; income: number; expenses: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      let inc = 0, exp = 0;
      for (const t of txByAccount) {
        const td = new Date(t.date);
        if (td >= start && td <= end) {
          const acc = accounts.find(a => a.id === t.accountId);
          const cur = acc?.currency ?? "USD";
          const usd = convertToUSD(t.amount, cur as any, rate || null) ?? 0;
          const cat = categories.find(c => c.id === t.categoryId);
          if (t.type === "income") {
            if (selectedIncomeCats.length > 0 && !incomeFilterSet.has(t.categoryId)) continue;
            if (!isBalanceAdjustmentPlus(cat?.name)) inc += usd;
          } else {
            if (selectedExpenseCats.length > 0 && !expenseFilterSet.has(t.categoryId)) continue;
            if (!isBalanceAdjustmentCategory(cat?.name)) exp += usd;
          }
        }
      }
      out.push({ month: labels[d.getMonth()], income: inc, expenses: exp });
    }
    return out;
  }, [txByAccount, accounts, rate, categories, incomeFilterSet, expenseFilterSet, selectedIncomeCats.length, selectedExpenseCats.length]);

  const budgetData = useMemo(() => {
    // Placeholder budgets (0) with actual monthly expenses per category
    const expTx = txByAccount.filter(t => t.type === "expense" && isCurrentMonth(t.date)).filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      return !isBalanceAdjustmentCategory(cat?.name);
    }).filter(t => selectedExpenseCats.length > 0 ? expenseFilterSet.has(t.categoryId) : true);
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
  }, [txByAccount, categories, accounts, rate, expenseFilterSet, selectedExpenseCats.length]);

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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Stats filter:</span>
              <select
                className="h-8 rounded-md border bg-background px-2 text-sm"
                value={statsScope}
                onChange={(e) => setStatsScope(e.target.value as any)}
                title="Filter KPIs by include_in_stats"
              >
                <option value="all">All categories</option>
                <option value="only">Only included in stats</option>
                <option value="exclude">Only excluded from stats</option>
              </select>
              <span className="text-sm text-muted-foreground">(affects KPI income/expenses/net)</span>
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
                categories={incomeCategories}
                selected={selectedIncomeCats}
                onChange={setSelectedIncomeCats}
                placeholder="Todas las categorías de Income"
              />
              <CategoryMultiSelect
                label="Elegir categorías Expense"
                categories={expenseCategories}
                selected={selectedExpenseCats}
                onChange={setSelectedExpenseCats}
                placeholder="Todas las categorías de Expense"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpensePieChart data={expensePieData} />
              <TrendLineChart data={trendData} />
            </div>
            <div>
              <BudgetComparisonChart data={budgetData} />
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsList />
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

