import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, CategoriesStore, TransactionsStore, newId, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";
import { useVESExchangeRate } from "@/lib/rates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const TransactionForm = () => {
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { rate } = useVESExchangeRate();
  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    };
    load();
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
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
  };

  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-6">Add Transaction</h3>
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
                  {date ? new Date(date).toLocaleDateString() : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date ? new Date(date) : undefined}
                  onSelect={(d) => {
                    if (d) {
                      const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
                      setDate(iso);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder={`Select ${type} category`} />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </form>
    </Card>
  );
};
