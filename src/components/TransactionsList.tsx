import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowUpCircle, ArrowDownCircle, Search, Pencil, Trash2, Calendar as CalendarIcon, Loader2, Plus, RefreshCw } from "lucide-react";
import * as Icons from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import { apiFetch } from "@/lib/http";
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
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import AccountMultiSelect from "@/components/AccountMultiSelect";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  const [filterIncomeCategories, setFilterIncomeCategories] = useState<string[]>([]);
  const [filterExpenseCategories, setFilterExpenseCategories] = useState<string[]>([]);
  const [filterAccounts, setFilterAccounts] = useState<string[]>([]);
  const [filterDate, setFilterDate] = useState<string>(""); // YYYY-MM-DD or empty (exact day)
  const [filterDateFrom, setFilterDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [filterDateTo, setFilterDateTo] = useState<string>(""); // YYYY-MM-DD
  const [filterMonth, setFilterMonth] = useState<string>(""); // YYYY-MM
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
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
  const [groupTotals, setGroupTotals] = useState<Record<string, { income: number; expenses: number; balance: number }>>({});
  // Server-side grouped pagination state
  const [nextCursorDate, setNextCursorDate] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const PAGE_SIZE = 20;
  // Track in-flight requests to prevent race conditions on rapid filter changes
  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const load = () => {
      // Keep categories and accounts reactive from the store
      setCategories(CategoriesStore.all());
      setAccounts(AccountsStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);

  // Fetch first page from server with grouped pagination (days kept intact)
  const mapServerTx = (t: any): Transaction => {
    const categoryId = String(t.category_id ?? t.categoryId);
    const accountId = String(t.account_id ?? t.accountId);
    const rawType = t.type;
    const type: 'income' | 'expense' = rawType === 'ingreso' ? 'income' : rawType === 'gasto' ? 'expense' : (rawType as any) || 'expense';
    const amount = Number(t.amount ?? 0);
    const amountUsd = t.amount_usd != null ? Number(t.amount_usd) : (t.amountUsd != null ? Number(t.amountUsd) : null);
    const exchangeRateUsed = t.exchange_rate_used != null ? Number(t.exchange_rate_used) : (t.exchangeRateUsed != null ? Number(t.exchangeRateUsed) : null);
    return {
      id: String(t.id),
      description: String(t.description ?? ''),
      amount,
      currency: t.currency || undefined,
      amountUsd,
      exchangeRateUsed,
      date: String(t.date),
      categoryId,
      accountId,
      type,
    } as Transaction;
  };

  const fetchLegacyAll = async (signal?: AbortSignal) => {
    // Backward-compatible fallback if grouped API is not available
    const arr = await apiFetch<any[]>(`transactions`, { signal });
    setTransactions((arr || []).map(mapServerTx));
    setNextCursorDate(null);
    setHasMore(false);
  };

  // Build query string with filters for server requests
  const buildQuery = (cursor?: string | null) => {
    const params = new URLSearchParams();
    params.set('grouped', '1');
    params.set('pageSize', String(PAGE_SIZE));
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (filterType !== 'all') params.set('type', filterType);
    const combinedCats = filterType === 'income'
      ? filterIncomeCategories
      : filterType === 'expense'
        ? filterExpenseCategories
        : [...filterIncomeCategories, ...filterExpenseCategories];
    if (combinedCats.length > 0) params.set('categoryId', combinedCats.join(','));
    if (filterAccounts.length > 0) params.set('accountId', filterAccounts.join(','));
  // Date/range/month precedence: dateFrom/dateTo > month > exact date
  if (filterDateFrom) params.set('dateFrom', filterDateFrom);
  if (filterDateTo) params.set('dateTo', filterDateTo);
  if (!filterDateFrom && !filterDateTo && filterMonth) params.set('month', filterMonth);
  if (!filterDateFrom && !filterDateTo && !filterMonth && filterDate) params.set('date', filterDate);
    if (cursor) params.set('cursorDate', cursor);
    return `transactions?${params.toString()}`;
  };

  const fetchFirstPage = async () => {
    try {
      setPageLoading(true);
      // Cancel previous in-flight request, if any
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myReqId = ++reqIdRef.current;
      const data: any = await apiFetch<any>(buildQuery(), { signal: controller.signal });
      // Ignore if a newer request has been issued
      if (myReqId !== reqIdRef.current) return;
      if (Array.isArray(data)) {
        // Legacy shape
        setTransactions((data as any[]).map(mapServerTx));
        setNextCursorDate(null);
        setHasMore(false);
      } else {
        setTransactions(((data?.items as any[]) || []).map(mapServerTx));
        setNextCursorDate((data?.nextCursorDate as string) || null);
        setHasMore(!!data?.hasMore);
      }
      // Reset computed caches for rates/totals to allow recompute for new days
      setVesRateByDate({});
      setGroupTotals({});
    } catch (e) {
      // Fallback to legacy endpoint if grouped not supported
      try {
        // If aborted due to a newer filter change, just exit silently
        if ((e as any)?.name === 'AbortError') return;
        // Otherwise, try legacy
        await fetchLegacyAll(abortRef.current?.signal);
      } catch (e2) {
        toast({ title: "Failed to load transactions", description: String(e2), variant: "destructive" });
      }
    } finally {
      setPageLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasMore || !nextCursorDate) return;
    try {
      setPageLoading(true);
      const data: any = await apiFetch<any>(buildQuery(nextCursorDate));
      if (Array.isArray(data)) {
        // Unexpected legacy shape for a paged call: just append and stop further paging
        setTransactions(prev => [...prev, ...(data as any[]).map(mapServerTx)]);
        setNextCursorDate(null);
        setHasMore(false);
      } else {
        setTransactions(prev => [...prev, ...(((data?.items as any[]) || []).map(mapServerTx))]);
        setNextCursorDate((data?.nextCursorDate as string) || null);
        setHasMore(!!data?.hasMore);
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    // Ensure base datasets are available
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    fetchFirstPage().catch(() => {});
    // Do not call TransactionsStore.refresh here to avoid loading the entire dataset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refetch when filters change (immediately)
  useEffect(() => {
    // Clear current results for snappier feedback and reset pagination
    setTransactions([]);
    setNextCursorDate(null);
    setHasMore(false);
    fetchFirstPage().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterType, filterIncomeCategories, filterExpenseCategories, filterAccounts, filterDate, filterDateFrom, filterDateTo, filterMonth]);
  const categoriesOptions = useMemo(() => categories, [categories]);
  const incomeCategoryOptions = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
  const expenseCategoryOptions = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);
  const accountsOptions = useMemo(() => accounts, [accounts]);
  const editCategories = useMemo(() => categories.filter(c => c.type === formData.type), [categories, formData.type]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchFirstPage();
      toast({ title: "Transactions Refreshed", description: "Latest transactions loaded (grouped by date)." });
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterIncomeCategories([]);
    setFilterExpenseCategories([]);
    setFilterAccounts([]);
    setFilterDate("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterMonth("");
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
      // Reload first page to keep pagination consistent
      await fetchFirstPage();
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
      await fetchFirstPage();
      setIsDialogOpen(false);
      setEditingTx(null);
      toast({ title: "Transaction Updated", description: "Your changes have been saved." });
    } finally {
      setSaving(false);
    }
  };

  // Apply a defensive client-side filter by type as well, in case the server ignores the param (e.g., grouped endpoint differences)
  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    return transactions.filter(t => t.type === filterType);
  }, [transactions, filterType]);

  // Always sort by date DESC (YYYY-MM-DD) to ensure correct grouping order regardless of insertion
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const ad = String(a.date || '').slice(0, 10);
    const bd = String(b.date || '').slice(0, 10);
    if (ad === bd) {
      // Secondary sort: try by numeric id desc if both look numeric, else string desc
      const an = Number(a.id);
      const bn = Number(b.id);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an;
      return String(b.id).localeCompare(String(a.id));
    }
    return bd.localeCompare(ad);
  });

  // Group by date
  const groupedTransactions = sortedTransactions.reduce((groups, transaction) => {
    const dateKey = transaction.date ? String(transaction.date).slice(0, 10) : '';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
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

  // Compute per-day totals (USD) for income/expenses.
  // Prefer server-provided amountUsd (and exchangeRateUsed) to ensure consistency with backend;
  // fallback to client historical conversion when not available.
  useEffect(() => {
    const dates = Object.keys(groupedTransactions);
    if (dates.length === 0) return;
    let mounted = true;
    (async () => {
      const updates: Record<string, { income: number; expenses: number; balance: number }> = {};
      await Promise.all(dates.map(async (d) => {
        if (groupTotals[d] !== undefined) return; // already computed
        // Exclude balance adjustment categories from daily totals
        const txs = groupedTransactions[d].filter(tx => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const name = (cat?.name || '').toLowerCase();
          return name !== 'ajuste de balance (+)' && name !== 'ajuste de balance (-)';
        });
        const usdValues = await Promise.all(txs.map(async (tx) => {
          if (tx.amountUsd != null) {
            return { type: tx.type, usd: tx.amountUsd } as { type: 'income' | 'expense'; usd: number };
          }
          const acc = accounts.find(a => a.id === tx.accountId);
          const cur = (tx as any).currency ?? acc?.currency ?? 'USD';
          const usd = await convertToUSDByDate(tx.amount, cur as any, tx.date);
          return { type: tx.type, usd: usd ?? 0 } as { type: 'income' | 'expense'; usd: number };
        }));
        const income = usdValues.filter(v => v.type === 'income').reduce((s, v) => s + v.usd, 0);
        const expenses = usdValues.filter(v => v.type === 'expense').reduce((s, v) => s + v.usd, 0);
        updates[d] = { income, expenses, balance: income - expenses };
      }));
      if (mounted && Object.keys(updates).length > 0) {
        setGroupTotals(prev => ({ ...prev, ...updates }));
      }
    })();
    return () => { mounted = false; };
  }, [groupedTransactions, accounts, categories, groupTotals]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Transaction Log</CardTitle>
            <CardDescription>View and filter your daily transactions</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <Button onClick={() => setIsAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm asModalContent onSubmitted={async () => { setIsAddOpen(false); await fetchFirstPage(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="space-y-3">
          {/* Compact top row for small screens */}
          <div className="grid grid-cols-1 sm:hidden gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
              <Collapsible open={advOpen} onOpenChange={setAdvOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="whitespace-nowrap">More Filters</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <CategoryMultiSelect
                    label="Categorías de Ingreso"
                    categories={incomeCategoryOptions}
                    selected={filterIncomeCategories}
                    onChange={setFilterIncomeCategories}
                    placeholder="Todas las de Ingreso"
                  />
                  <CategoryMultiSelect
                    label="Categorías de Gasto"
                    categories={expenseCategoryOptions}
                    selected={filterExpenseCategories}
                    onChange={setFilterExpenseCategories}
                    placeholder="Todas las de Gasto"
                  />
                  <AccountMultiSelect
                    label="Accounts"
                    accounts={accountsOptions}
                    selected={filterAccounts}
                    onChange={setFilterAccounts}
                    placeholder="All Accounts"
                  />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-24">Exact day</label>
                        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-24">Range</label>
                        <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} placeholder="From" />
                        <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} placeholder="To" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-24">Month</label>
                        <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          Refresh
                        </Button>
                      </div>
                    </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Full filter bar for >= sm */}
          <div className="hidden sm:grid items-end gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="lg:col-span-1">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-1">
              <CategoryMultiSelect
                label="Categorías de Ingreso"
                categories={incomeCategoryOptions}
                selected={filterIncomeCategories}
                onChange={setFilterIncomeCategories}
                placeholder="Todas las de Ingreso"
              />
            </div>
            <div className="lg:col-span-1">
              <CategoryMultiSelect
                label="Categorías de Gasto"
                categories={expenseCategoryOptions}
                selected={filterExpenseCategories}
                onChange={setFilterExpenseCategories}
                placeholder="Todas las de Gasto"
              />
            </div>
            <div className="lg:col-span-1">
              <AccountMultiSelect
                label="Accounts"
                accounts={accountsOptions}
                selected={filterAccounts}
                onChange={setFilterAccounts}
                placeholder="All Accounts"
              />
            </div>
            <div className="flex flex-col gap-2 lg:col-span-2">
              <div className="flex items-center gap-2">
                <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                <div className="text-sm text-muted-foreground">Exact day</div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} placeholder="From" />
                <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} placeholder="To" />
                <div className="text-sm text-muted-foreground">Range</div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
                <div className="text-sm text-muted-foreground">Month</div>
                <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
        

        {/* Transaction List */}
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground flex-1">
                  <div className="h-px bg-border flex-1" />
                  <span className="px-3">
                    {dayjs(String(date).slice(0,10)).format('dddd, MMM D, YYYY')} • Tasa: {vesRateByDate[date] != null ? Number(vesRateByDate[date]).toFixed(2) : '…'}
                  </span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="sm:ml-3 flex items-center gap-2 text-xs whitespace-nowrap">
                  <Badge variant="outline" className="border-green-500 text-green-600">+${(groupTotals[date]?.income ?? 0).toFixed(2)}</Badge>
                  <Badge variant="outline" className="border-red-500 text-red-600">-${(groupTotals[date]?.expenses ?? 0).toFixed(2)}</Badge>
                  <Badge variant="secondary" className="font-semibold">Bal: ${(groupTotals[date]?.balance ?? 0).toFixed(2)}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-1 sm:grid-cols-[auto,1fr,auto,auto] items-center gap-3 p-4 rounded-lg bg-card border border-border hover:shadow-sm transition-shadow"
                  >
                    <div className="">
                      {transaction.type === "income" ? (
                        <ArrowUpCircle className="h-8 w-8 text-primary" />
                      ) : (
                        <ArrowDownCircle className="h-8 w-8 text-accent" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-foreground sm:truncate">
                        {transaction.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mt-1">
                        {(() => {
                          const cat = categories.find(c => c.id === transaction.categoryId);
                          const acc = accounts.find(a => a.id === transaction.accountId);
                          return (
                            <>
                              {cat?.icon && (Icons as any)[cat.icon] ? (
                                (() => { const C = (Icons as any)[cat.icon]; return <C className="h-4 w-4" style={{ color: cat?.color || undefined }} />; })()
                              ) : null}
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat?.color || "hsl(var(--muted))" }}
                              />
                              <p className="text-sm text-muted-foreground">{cat?.name || "Uncategorized"}</p>
                              {acc ? (
                                <Badge variant="secondary" className="ml-1 text-xs md:text-sm font-semibold">
                                  {acc.name} ({acc.currency})
                                </Badge>
                              ) : null}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="justify-self-end">
                      <TxAmount
                        transaction={transaction}
                        accounts={accounts}
                        rateForDate={vesRateByDate[String(date).slice(0,10)] ?? null}
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-self-end">
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
          {filteredTransactions.length === 0 && !pageLoading && (
            <div className="text-center py-12 text-muted-foreground">
              No transactions found. Try adjusting your filters.
            </div>
          )}
          <div className="flex justify-center pt-2">
            {pageLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
            ) : hasMore ? (
              <Button variant="outline" onClick={fetchNextPage}>Load more days</Button>
            ) : null}
          </div>
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
                    {formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : <span>Pick a date</span>}
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
                <Select value={formData.type} onValueChange={(v: any) => {
                  const nextType = v as 'income' | 'expense';
                  // If current category doesn't match new type, clear it
                  const currentCat = categories.find(c => c.id === formData.categoryId);
                  const nextCategoryId = currentCat && currentCat.type === nextType ? formData.categoryId : "";
                  setFormData({ ...formData, type: nextType, categoryId: nextCategoryId });
                }}>
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
                  {editCategories.map(cat => (
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
const TxAmount = ({ transaction, accounts, rateForDate }: { transaction: Transaction; accounts: Account[]; rateForDate?: number | null }) => {
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
    // If we have the per-day rate from parent, compute synchronously for stability
    if (rateForDate != null && isFinite(rateForDate) && rateForDate > 0) {
      const value = transaction.amount / rateForDate;
      setUsd(value);
      return;
    }
    // Fallback to historical fetch
    (async () => {
      const converted = await convertToUSDByDate(transaction.amount, currency as any, transaction.date);
      if (mounted) setUsd(converted);
    })();
    return () => { mounted = false; };
  }, [transaction.amount, transaction.date, currency, transaction.amountUsd, rateForDate]);

  return (
    <div className={`text-right ${transaction.type === "income" ? "text-primary" : "text-destructive"}`}>
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
