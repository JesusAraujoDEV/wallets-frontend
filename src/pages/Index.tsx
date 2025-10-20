import { useEffect, useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { TrendLineChart } from "@/components/TrendLineChart";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionsList } from "@/components/TransactionsList";
import { CategoryManager } from "@/components/CategoryManager";
import { AccountManager } from "@/components/AccountManager";
import { AccountSelector } from "@/components/AccountSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// No import/export UI; data persistence handled via storage functions
import { useSearchParams } from "react-router-dom";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { useVESExchangeRate, convertToUSD } from "@/lib/rates";
import type { Account, Category, Transaction } from "@/lib/types";

// Dashboard data is derived from localStorage (JSON DB)

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { rate } = useVESExchangeRate();
  const [searchParams, setSearchParams] = useSearchParams();

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
  
  // KPIs derived from data
  const totalBalance = useMemo(() => {
    if (selectedAccount === "all") {
      // Sum all accounts in USD
      return accounts.reduce((sum, a) => {
        const usd = convertToUSD(a.balance || 0, a.currency, rate || null);
        return sum + (usd ?? 0);
      }, 0);
    }
    const acc = accounts.find(a => a.id === selectedAccount);
    if (!acc) return 0;
    const usd = convertToUSD(acc.balance || 0, acc.currency, rate || null);
    return usd ?? 0;
  }, [accounts, selectedAccount, rate]);

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const isCurrentMonth = (iso: string) => {
    const d = new Date(iso);
    return d >= firstOfMonth && d <= now;
  };
  const txByAccount = useMemo(() => (
    transactions.filter(t => selectedAccount === "all" || t.accountId === selectedAccount)
  ), [transactions, selectedAccount]);

  const { totalIncome, totalExpenses } = useMemo(() => {
    const monthTx = txByAccount.filter(t => isCurrentMonth(t.date));
    let inc = 0, exp = 0;
    for (const t of monthTx) {
      const acc = accounts.find(a => a.id === t.accountId);
      const cur = acc?.currency ?? "USD";
      const usdAmount = convertToUSD(t.amount, cur as any, rate || null) ?? 0;
      if (t.type === "income") inc += usdAmount; else exp += usdAmount;
    }
    return { totalIncome: inc, totalExpenses: exp };
  }, [txByAccount, accounts, rate]);

  // Charts
  const expensePieData = useMemo(() => {
    const expTx = txByAccount.filter(t => t.type === "expense" && isCurrentMonth(t.date));
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
  }, [txByAccount, categories, accounts, rate]);

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
          if (t.type === "income") inc += usd; else exp += usd;
        }
      }
      out.push({ month: labels[d.getMonth()], income: inc, expenses: exp });
    }
    return out;
  }, [txByAccount, accounts, rate]);

  const budgetData = useMemo(() => {
    // Placeholder budgets (0) with actual monthly expenses per category
    const expTx = txByAccount.filter(t => t.type === "expense" && isCurrentMonth(t.date));
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
  }, [txByAccount, categories, accounts, rate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your finances with clarity</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Persistence uses localStorage via helper functions; no import/export UI */}
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Balance (USD)"
            value={`$${totalBalance.toFixed(2)}`}
            icon={Wallet}
            trend={{ value: "", isPositive: true }}
            colorScheme="primary"
          />
          <KPICard
            title="Monthly Income (USD)"
            value={`$${totalIncome.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: "", isPositive: true }}
            colorScheme="secondary"
          />
          <KPICard
            title="Monthly Expenses (USD)"
            value={`$${totalExpenses.toFixed(2)}`}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpensePieChart data={expensePieData} />
              <TrendLineChart data={trendData} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BudgetComparisonChart data={budgetData} />
              </div>
              <div>
                <TransactionForm />
              </div>
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
