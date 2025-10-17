import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, CategoriesStore, TransactionsStore, newId, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";

export const TransactionForm = () => {
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const filteredCategories = categories.filter((c) => c.type === type);

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

  const handleSubmit = (e: React.FormEvent) => {
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
    TransactionsStore.add({
      id: newId(),
      date: new Date().toISOString().slice(0, 10),
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
                    <span className="text-xs text-foreground/80">
                      {acc.currency === "USD" && "$"}
                      {acc.currency === "EUR" && "€"}
                      {acc.currency === "VES" && "Bs."}
                      {acc.balance.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
