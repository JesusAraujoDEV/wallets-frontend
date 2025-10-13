import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { TrendLineChart } from "@/components/TrendLineChart";
import { BudgetComparisonChart } from "@/components/BudgetComparisonChart";
import { TransactionForm } from "@/components/TransactionForm";

// Mock data
const expenseData = [
  { category: "Food & Dining", amount: 1200, color: "hsl(var(--chart-1))" },
  { category: "Transportation", amount: 450, color: "hsl(var(--chart-2))" },
  { category: "Shopping", amount: 800, color: "hsl(var(--chart-3))" },
  { category: "Entertainment", amount: 300, color: "hsl(var(--chart-4))" },
  { category: "Bills", amount: 600, color: "hsl(var(--chart-5))" },
  { category: "Healthcare", amount: 200, color: "hsl(var(--chart-6))" },
];

const trendData = [
  { month: "Jan", income: 5000, expenses: 3500 },
  { month: "Feb", income: 5200, expenses: 3800 },
  { month: "Mar", income: 4800, expenses: 3600 },
  { month: "Apr", income: 5500, expenses: 4200 },
  { month: "May", income: 5300, expenses: 3900 },
  { month: "Jun", income: 5600, expenses: 4100 },
];

const budgetData = [
  { category: "Food", budget: 1500, actual: 1200 },
  { category: "Transport", budget: 500, actual: 450 },
  { category: "Shopping", budget: 700, actual: 800 },
  { category: "Entertainment", budget: 400, actual: 300 },
  { category: "Bills", budget: 600, actual: 600 },
];

const Index = () => {
  const totalBalance = 8450.00;
  const totalIncome = 5600.00;
  const totalExpenses = 4100.00;

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
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Balance"
            value={`$${totalBalance.toFixed(2)}`}
            icon={Wallet}
            trend={{ value: "12.5%", isPositive: true }}
            colorScheme="primary"
          />
          <KPICard
            title="Monthly Income"
            value={`$${totalIncome.toFixed(2)}`}
            icon={TrendingUp}
            trend={{ value: "5.8%", isPositive: true }}
            colorScheme="secondary"
          />
          <KPICard
            title="Monthly Expenses"
            value={`$${totalExpenses.toFixed(2)}`}
            icon={TrendingDown}
            trend={{ value: "2.3%", isPositive: false }}
            colorScheme="accent"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ExpensePieChart data={expenseData} />
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
      </main>
    </div>
  );
};

export default Index;
