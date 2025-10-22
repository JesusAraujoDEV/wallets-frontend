import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, CategoriesStore, TransactionsStore, newId, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";
import { useVESExchangeRate } from "@/lib/rates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const TransactionForm = ({ asModalContent = false, onSubmitted }: { asModalContent?: boolean; onSubmitted?: () => void }) => {
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { rate } = useVESExchangeRate();
  const [submitting, setSubmitting] = useState(false);
  const filteredCategories = categories.filter((c) => c.type === type);
  const [isCatPickerOpen, setIsCatPickerOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatColor, setNewCatColor] = useState<string>("hsl(var(--chart-6))");
  const [newCatColorName, setNewCatColorName] = useState<string>("Pastel Blue");
  const [newCatIcon, setNewCatIcon] = useState<string | null>(null);

  const ICON_OPTIONS_EXPENSE: string[] = [
    "ShoppingCart","ShoppingBag","ShoppingBasket","Store",
    "Gift","Percent","Receipt","Banknote",
    "Scissors","Users","Home","Car",
    "Fuel","Droplet","Film","Ticket",
    "Gamepad2","Tv","Puzzle","Paperclip",
    "FileText","PenLine","Pencil","Utensils",
    "Pizza","Shirt","SquareParking","Cloud",
    "Database","GraduationCap","Music2"
  ];
  const ICON_OPTIONS_INCOME: string[] = [
    "Wallet","PiggyBank","Banknote","DollarSign",
    "Coins","ArrowLeftRight","Users","Home",
    "Heart","Calendar","CalendarCheck","Briefcase",
    "CheckCircle2","FileCheck","PackageCheck","BadgeCheck",
    "BriefcaseMedical","Hospital","ShoppingBasket","CreditCard","Gamepad2"
  ];
  const ICON_OPTIONS: string[] = (type === "expense" ? ICON_OPTIONS_EXPENSE : ICON_OPTIONS_INCOME);

  const uiCategories = filteredCategories.filter((c) => {
    const n = c.name.toLowerCase();
    return n !== "ajuste de balance (+)" && n !== "ajuste de balance (-)";
  });

  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    };
    load();
    const off = onDataChange(load);
    return off;
  }, []);

  // Ensure selected category matches the chosen type
  useEffect(() => {
    if (category && !filteredCategories.some((c) => c.id === category)) {
      setCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || !amount || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including the account.",
        variant: "destructive",
      });
      return;
    }

    const selectedAccount = accounts.find(acc => acc.id === account);
    const selectedCategory = categories.find(cat => cat.id === category);

    try {
      setSubmitting(true);
      // Persist transaction
      await TransactionsStore.add({
        id: newId(),
        date: date || new Date().toISOString().slice(0, 10),
        description: description || (type === "income" ? "Income" : "Expense"),
        categoryId: selectedCategory?.id || "",
        accountId: selectedAccount?.id || "",
        amount: parseFloat(amount),
        type,
      });
      toast({
        title: "Transaction Added",
        description: `${type === "income" ? "Income" : "Expense"} of $${amount} recorded to ${selectedAccount?.name}.`,
      });

      // Reset form
      setAccount("");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  const formEl = (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="account">Account</Label>
          <Select value={account} onValueChange={setAccount}>
            <SelectTrigger id="account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{acc.name}</span>
                      <span className="text-xs text-muted-foreground">({acc.currency})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-foreground/80">
                        {acc.currency === "USD" && "$"}
                        {acc.currency === "EUR" && "€"}
                        {acc.currency === "VES" && "Bs."}
                        {acc.balance.toFixed(2)}
                      </div>
                      {acc.currency === "VES" && rate?.vesPerUsd ? (
                        <div className="text-[10px] text-muted-foreground">$
                          {(acc.balance / rate.vesPerUsd).toFixed(2)} USD
                        </div>
                      ) : null}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as "income" | "expense")}>
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
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
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
                  {date ? dayjs(date).format('YYYY-MM-DD') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={date ? dayjs(date) : null}
                    onChange={(d:any) => {
                      if (d) {
                        const iso = d.format('YYYY-MM-DD');
                        setDate(iso);
                      }
                    }}
                  />
                </LocalizationProvider>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCatPickerOpen(true)}
            className="w-full justify-start"
          >
            {(() => {
              const selected = uiCategories.find(c => c.id === category) || filteredCategories.find(c => c.id === category);
              return selected ? (
                <span className="flex items-center gap-2">
                  {selected.icon && (Icons as any)[selected.icon] ? (
                    (() => { const C = (Icons as any)[selected.icon]; return <C className="h-4 w-4" style={{ color: selected.color || undefined }} />; })()
                  ) : null}
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: selected.color || "hsl(var(--muted))" }}
                  />
                  <span className="truncate">{selected.name}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Select {type} category</span>
              );
            })()}
          </Button>
        </div>
        <Dialog open={isCatPickerOpen} onOpenChange={setIsCatPickerOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="text-sm text-muted-foreground">Type: <span className="font-medium capitalize">{type}</span></div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-2">
                {uiCategories.map((cat) => {
                  const selected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setIsCatPickerOpen(false); }}
                      className={cn(
                        "flex items-start text-left gap-2 px-3 py-2 rounded-md border text-sm h-auto w-full max-w-full",
                        selected ? "bg-accent border-accent ring-2 ring-accent/50" : "hover:bg-accent/40"
                      )}
                      title={cat.name}
                    >
                      {cat.icon && (Icons as any)[cat.icon] ? (
                        (() => { const C = (Icons as any)[cat.icon]; return <C className="h-5 w-5 shrink-0" style={{ color: cat.color || undefined }} />; })()
                      ) : null}
                      <span
                        className="inline-block w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || "hsl(var(--muted))" }}
                      />
                      <span className="flex-1 min-w-0 whitespace-normal break-normal leading-tight">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 border-t" />
              <div className="space-y-2">
                <Label htmlFor="newCatName">Create new category</Label>
                <div className="flex gap-2">
                  <Input id="newCatName" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Groceries" />
                  <Button
                    type="button"
                    onClick={async () => {
                      const name = newCatName.trim();
                      if (!name) {
                        toast({ title: "Missing name", description: "Please enter a category name.", variant: "destructive" });
                        return;
                      }
                      try {
                        setCreatingCat(true);
                        const tempId = newId();
                        await CategoriesStore.upsert({ id: tempId, name, type, color: newCatColor, colorName: newCatColorName, icon: newCatIcon ?? undefined });
                        const created = CategoriesStore.all().find(c => c.name.toLowerCase() === name.toLowerCase() && c.type === type);
                        if (created) {
                          setCategory(created.id);
                          setIsCatPickerOpen(false);
                        }
                        setNewCatName("");
                        setNewCatColor("hsl(var(--chart-6))");
                        setNewCatColorName("Pastel Blue");
                        setNewCatIcon(null);
                        toast({ title: "Category created", description: `${name} added to ${type}.` });
                      } finally {
                        setCreatingCat(false);
                      }
                    }}
                    disabled={creatingCat}
                  >
                    {creatingCat ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Create</>) : 'Create'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {[
                      { color: "hsl(var(--chart-1))", name: "Chart 1" },
                      { color: "hsl(var(--chart-2))", name: "Chart 2" },
                      { color: "hsl(var(--chart-3))", name: "Chart 3" },
                      { color: "hsl(var(--chart-4))", name: "Chart 4" },
                      { color: "hsl(var(--chart-5))", name: "Chart 5" },
                      { color: "hsl(var(--chart-6))", name: "Pastel Blue" },
                      { color: "hsl(var(--primary))", name: "Primary" },
                      { color: "hsl(var(--secondary))", name: "Secondary" },
                      { color: "hsl(var(--accent))", name: "Accent" },
                      { color: "#22c55e", name: "Green" },
                      { color: "#ef4444", name: "Red" },
                      { color: "#f59e0b", name: "Amber" },
                    ].map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        className={cn(
                          "h-8 w-8 rounded-full border",
                          newCatColor === opt.color ? "ring-2 ring-offset-2 ring-accent" : ""
                        )}
                        style={{ backgroundColor: opt.color }}
                        title={opt.name}
                        onClick={() => { setNewCatColor(opt.color); setNewCatColorName(opt.name); }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {ICON_OPTIONS.map((key) => {
                      const C = (Icons as any)[key];
                      if (!C) return null;
                      const active = newCatIcon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={cn(
                            "h-10 w-10 rounded-md border flex items-center justify-center",
                            active ? "bg-accent ring-2 ring-accent/70" : "hover:bg-accent/40"
                          )}
                          title={key}
                          onClick={() => setNewCatIcon(key)}
                        >
                          <C className="h-5 w-5" style={{ color: newCatColor || undefined }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            type="text"
            placeholder="Add a note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={submitting} aria-busy={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Transaction
            </>
          )}
        </Button>
      </form>
  );

  if (asModalContent) {
    return formEl;
  }

  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-6">Add Transaction</h3>
      {formEl}
    </Card>
  );
};
