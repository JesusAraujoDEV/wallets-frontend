import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, newId, onDataChange } from "@/lib/storage";
import type { Account } from "@/lib/types";
import { useVESExchangeRate } from "@/lib/rates";

// All accounts are now loaded from localStorage via AccountsStore

const currencySymbols = {
  USD: "$",
  EUR: "€",
  VES: "Bs.",
};

export const AccountManager = () => {
  const [accounts, setAccounts] = useState<Account[]>(AccountsStore.all());
  const { rate } = useVESExchangeRate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD" as "USD" | "EUR" | "VES",
    balance: "",
  });

  const resetForm = () => {
    setFormData({ name: "", currency: "USD", balance: "" });
    setEditingAccount(null);
  };

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        currency: account.currency,
        balance: account.balance.toString(),
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.balance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingAccount) {
      const updated: Account = {
        ...editingAccount,
        name: formData.name,
        currency: formData.currency,
        balance: parseFloat(formData.balance),
      };
      AccountsStore.upsert(updated);
      toast({
        title: "Account Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      const newAccount: Account = {
        id: newId(),
        name: formData.name,
        currency: formData.currency,
        balance: parseFloat(formData.balance),
      };
      AccountsStore.upsert(newAccount);
      toast({
        title: "Account Created",
        description: `${formData.name} has been created successfully.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (accountId: string) => {
    AccountsStore.remove(accountId);
    toast({
      title: "Account Deleted",
      description: "The account has been removed.",
    });
  };

  // Sync local state with storage changes (in case other components modify data)
  useEffect(() => {
    setAccounts(AccountsStore.all());
    const off = onDataChange(() => setAccounts(AccountsStore.all()));
    return off;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
          <p className="text-muted-foreground mt-1">Create and manage your financial accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Account" : "Create New Account"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  placeholder="e.g., Checking, Savings, Cash"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value as "USD" | "EUR" | "VES" })}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="VES">VES - Venezuelan Bolívar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                  {editingAccount ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* No import/export UI; persistence handled via functions (localStorage) */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="p-6 shadow-md border-0 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-light text-primary-foreground">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{account.name}</h3>
                  <p className="text-sm text-muted-foreground">{account.currency}</p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-2xl font-bold text-foreground">
                {currencySymbols[account.currency]}{account.balance.toFixed(2)}
              </p>
              {account.currency === "VES" && rate?.vesPerUsd ? (
                <p className="text-xs text-muted-foreground mt-1">≈ $
                  {(account.balance / rate.vesPerUsd).toFixed(2)} USD
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog(account)}
                className="flex-1"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(account.id)}
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};