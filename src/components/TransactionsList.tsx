import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import type { Transaction, Category } from "@/lib/types";

export const TransactionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = () => {
      setTransactions(TransactionsStore.all());
      setCategories(CategoriesStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);
  const categoriesOptions = useMemo(() => categories, [categories]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const cat = categories.find(c => c.id === transaction.categoryId);
    const catName = cat?.name ?? "";
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          catName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.categoryId === filterCategory;
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
              {categoriesOptions.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
                        {(() => {
                          const cat = categories.find(c => c.id === transaction.categoryId);
                          return (
                            <>
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat?.color || "hsl(var(--muted))" }}
                              />
                              <p className="text-sm text-muted-foreground">{cat?.name || "Uncategorized"}</p>
                            </>
                          );
                        })()}
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
