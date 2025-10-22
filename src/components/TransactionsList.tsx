import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowUpCircle, ArrowDownCircle, Search, Pencil, Trash2, Calendar as CalendarIcon, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { convertToUSDByDate, getRateByDate } from "@/lib/rates";
import type { Transaction, Category, Account } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { cn } from "@/lib/utils";
import { TransactionForm } from "@/components/TransactionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TransactionsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accountId: "",
    type: "expense" as "income" | "expense",
    amount: "",
    categoryId: "",
    description: "",
    date: "",
  });
  const [vesRateByDate, setVesRateByDate] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const load = () => {
      setTransactions(TransactionsStore.all());
      setCategories(CategoriesStore.all());
      setAccounts(AccountsStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);
  const categoriesOptions = useMemo(() => categories, [categories]);
  const accountsOptions = useMemo(() => accounts, [accounts]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await TransactionsStore.refresh();
      toast({ title: "Transactions Refreshed", description: "Latest transactions loaded." });
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      accountId: tx.accountId,
      type: tx.type,
      amount: tx.amount.toString(),
      categoryId: tx.categoryId,
      description: tx.description,
      date: tx.date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await TransactionsStore.remove(id);
      toast({ title: "Transaction Deleted", description: "The transaction has been removed." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    if (!formData.accountId || !formData.categoryId || !formData.amount) {
      toast({ title: "Missing Information", description: "Please complete all required fields.", variant: "destructive" });
      return;
    }
    const next: Transaction = {
      ...editingTx,
      accountId: formData.accountId,
      type: formData.type,
      amount: parseFloat(formData.amount),
      categoryId: formData.categoryId,
      description: formData.description,
      date: formData.date || editingTx.date,
    };
    try {
      setSaving(true);
      await TransactionsStore.update(next);
      setIsDialogOpen(false);
      setEditingTx(null);
      toast({ title: "Transaction Updated", description: "Your changes have been saved." });
    } finally {
      setSaving(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const cat = categories.find(c => c.id === transaction.categoryId);
    const catName = cat?.name ?? "";
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          catName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.categoryId === filterCategory;
    const matchesAccount = filterAccount === "all" || transaction.accountId === filterAccount;
    return matchesSearch && matchesType && matchesCategory && matchesAccount;
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

  // Fetch VES/USD rate per date group (cached by localStorage in getRateByDate)
  useEffect(() => {
    const dates = Object.keys(groupedTransactions);
    if (dates.length === 0) return;
    let mounted = true;
    (async () => {
      const updates: Record<string, number | null> = {};
      await Promise.all(dates.map(async (d) => {
        if (vesRateByDate[d] !== undefined) return; // already have
        const snap = await getRateByDate(d);
        updates[d] = snap?.vesPerUsd ?? null;
      }));
      if (mounted && Object.keys(updates).length > 0) {
        setVesRateByDate(prev => ({ ...prev, ...updates }));
      }
    })();
    return () => { mounted = false; };
  }, [groupedTransactions, vesRateByDate]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Transaction Log</CardTitle>
            <CardDescription>View and filter your daily transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm asModalContent onSubmitted={() => setIsAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Select value={filterAccount} onValueChange={setFilterAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accountsOptions.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
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
                <span className="px-3">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {" , tasa USD: "}
                  {vesRateByDate[date] != null ? vesRateByDate[date]?.toFixed(4) : '…'}
                </span>
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
                    <TxAmount
                      transaction={transaction}
                      accounts={accounts}
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(transaction)} disabled={deletingId === transaction.id}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setConfirmDeleteId(transaction.id)} disabled={deletingId === transaction.id}>
                        {deletingId === transaction.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? new Date(formData.date).toLocaleDateString() : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateCalendar
                      value={formData.date ? dayjs(formData.date) : null}
                      onChange={(d:any) => {
                        if (d) {
                          const iso = d.format('YYYY-MM-DD');
                          setFormData({ ...formData, date: iso });
                        }
                      }}
                    />
                  </LocalizationProvider>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accountsOptions.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesOptions.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a note..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving} aria-busy={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <TransactionsDeleteConfirm
        open={!!confirmDeleteId}
        onOpenChange={(open) => setConfirmDeleteId(open ? confirmDeleteId : null)}
        busy={!!deletingId}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          await handleDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </Card>
  );
};

// Inline component to render transaction amount in original currency and USD (by date)
const TxAmount = ({ transaction, accounts }: { transaction: Transaction; accounts: Account[] }) => {
  const acc = accounts.find(a => a.id === transaction.accountId);
  const currency = transaction.currency ?? acc?.currency ?? "USD";
  const sign = transaction.type === "income" ? "+" : "-";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "Bs.";
  const [usd, setUsd] = useState<number | null>(transaction.amountUsd ?? null);

  useEffect(() => {
    let mounted = true;
    // If server provided USD equivalence, prefer it; else compute client-side
    if (transaction.amountUsd != null) {
      setUsd(transaction.amountUsd);
      return;
    }
    if (currency === 'USD') {
      setUsd(transaction.amount);
      return;
    }
    (async () => {
      const converted = await convertToUSDByDate(transaction.amount, currency as any, transaction.date);
      if (mounted) setUsd(converted);
    })();
    return () => { mounted = false; };
  }, [transaction.amount, transaction.date, currency, transaction.amountUsd]);

  return (
    <div className={`text-right ${transaction.type === "income" ? "text-primary" : "text-foreground"}`}>
      <div className="text-lg font-semibold">
        {sign}{symbol}{transaction.amount.toFixed(2)}
      </div>
      {currency !== "USD" && usd != null ? (
        <div className="text-xs text-muted-foreground">≈ {sign}${usd.toFixed(2)} USD</div>
      ) : null}
    </div>
  );
};

// Confirm delete dialog (mounted once at bottom of list card)
// Note: Placing here to keep file self-contained; dialog is rendered at same level as the list Card.
export const TransactionsDeleteConfirm = ({
  open,
  onOpenChange,
  onConfirm,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  busy: boolean;
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the transaction from your history.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
