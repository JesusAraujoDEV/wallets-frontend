import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  color: string;
}

// Mock transaction data
const mockTransactions: Transaction[] = [
  { id: "1", date: "2025-10-13", description: "Salary", category: "Income", amount: 5600, type: "income", color: "hsl(var(--chart-1))" },
  { id: "2", date: "2025-10-13", description: "Grocery Shopping", category: "Food & Dining", amount: 120, type: "expense", color: "hsl(var(--chart-1))" },
  { id: "3", date: "2025-10-12", description: "Gas Station", category: "Transportation", amount: 45, type: "expense", color: "hsl(var(--chart-2))" },
  { id: "4", date: "2025-10-12", description: "Netflix Subscription", category: "Entertainment", amount: 15, type: "expense", color: "hsl(var(--chart-4))" },
  { id: "5", date: "2025-10-11", description: "Freelance Project", category: "Income", amount: 800, type: "income", color: "hsl(var(--chart-1))" },
  { id: "6", date: "2025-10-11", description: "Restaurant Dinner", category: "Food & Dining", amount: 85, type: "expense", color: "hsl(var(--chart-1))" },
  { id: "7", date: "2025-10-10", description: "Online Shopping", category: "Shopping", amount: 150, type: "expense", color: "hsl(var(--chart-3))" },
  { id: "8", date: "2025-10-10", description: "Electricity Bill", category: "Bills", amount: 95, type: "expense", color: "hsl(var(--chart-5))" },
  { id: "9", date: "2025-10-09", description: "Coffee Shop", category: "Food & Dining", amount: 12, type: "expense", color: "hsl(var(--chart-1))" },
  { id: "10", date: "2025-10-09", description: "Uber Ride", category: "Transportation", amount: 28, type: "expense", color: "hsl(var(--chart-2))" },
];

export const TransactionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Get unique categories
  const categories = Array.from(new Set(mockTransactions.map(t => t.category)));

  // Filter transactions
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Transaction Log</CardTitle>
        <CardDescription>View and filter your daily transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <div className="h-px bg-border flex-1" />
                <span className="px-3">{new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="space-y-2">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      {transaction.type === "income" ? (
                        <ArrowUpCircle className="h-8 w-8 text-primary" />
                      ) : (
                        <ArrowDownCircle className="h-8 w-8 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.color }}
                        />
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      transaction.type === "income" ? "text-primary" : "text-foreground"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found. Try adjusting your filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
