import { useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { Transaction } from "@/lib/types";

interface DashboardStatsProps {
  transactions: Transaction[];
}

const normalizeType = (type?: string | null) => {
  if (!type) return null;
  const t = String(type).toLowerCase();
  if (t === "income" || t === "ingreso") return "income" as const;
  if (t === "expense" || t === "gasto") return "expense" as const;
  return null;
};

const toUsd = (tx: Transaction) => {
  if (tx.amountUsd != null && isFinite(Number(tx.amountUsd))) return Number(tx.amountUsd);
  if (tx.amount != null && isFinite(Number(tx.amount))) return Number(tx.amount);
  return 0;
};

export function DashboardStats({ transactions }: DashboardStatsProps) {
  const { totalBalance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const isCurrentMonth = (iso: string) => {
      const d = new Date(iso);
      return d >= firstOfMonth && d <= now;
    };

    let incomeTotal = 0;
    let expenseTotal = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    for (const tx of transactions) {
      const type = normalizeType(tx.type);
      if (!type) continue;
      const usd = toUsd(tx);
      if (type === "income") incomeTotal += usd;
      if (type === "expense") expenseTotal += usd;
      if (tx.date && isCurrentMonth(tx.date)) {
        if (type === "income") monthIncome += usd;
        if (type === "expense") monthExpense += usd;
      }
    }

    return {
      totalBalance: incomeTotal - expenseTotal,
      monthlyIncome: monthIncome,
      monthlyExpenses: monthExpense,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Total Balance (USD)</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">${totalBalance.toFixed(2)}</h3>
            <p className="text-sm font-medium text-primary">+</p>
          </div>
          <div className="p-3 rounded-xl bg-primary-light text-primary-foreground">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Monthly Income (USD)</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">${monthlyIncome.toFixed(2)}</h3>
            <p className="text-sm font-medium text-primary">+</p>
          </div>
          <div className="p-3 rounded-xl bg-secondary-light text-secondary-foreground">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-card text-card-foreground p-6 shadow-md hover:shadow-lg transition-all duration-300 border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Monthly Expenses (USD)</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">${monthlyExpenses.toFixed(2)}</h3>
            <p className="text-sm font-medium text-destructive"></p>
          </div>
          <div className="p-3 rounded-xl bg-accent-light text-accent-foreground">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
