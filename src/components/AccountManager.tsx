import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { PlusCircle, Pencil, Trash2, Wallet, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AccountsStore, CategoriesStore, TransactionsStore, newId, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.balance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
  if (editingAccount) {
        const prevBalance = editingAccount.balance;
        const nextBalance = parseFloat(formData.balance);
        const changedBalance = isFinite(nextBalance) && nextBalance !== prevBalance;

        if (changedBalance) {
          // 1) Update account details (name/currency) but keep balance unchanged here
          const updatedMeta: Account = {
            ...editingAccount,
            name: formData.name,
            currency: formData.currency,
            balance: prevBalance, // keep; balance will be adjusted via transaction
          };
          await AccountsStore.upsert(updatedMeta);

          // 2) Ensure adjustment category exists
          const delta = Number((nextBalance - prevBalance).toFixed(2));
          const adjType: "income" | "expense" = delta > 0 ? "income" : "expense";
          const ensureAdjustmentCategory = async (kind: "income" | "expense"): Promise<Category> => {
            const name = kind === "income" ? "Ajuste de Balance (+)" : "Ajuste de Balance (-)";
            // 1) Try from cache first
            let cat = CategoriesStore.all().find(c => c.name === name);
            if (cat) return cat;
            // 2) Try create; if duplicate error occurs (race), refresh and read again
            try {
              const newCat: Category = {
                id: newId(),
                name,
                type: kind,
                color: kind === "income" ? "hsl(var(--chart-2))" : "hsl(var(--chart-3))",
                colorName: kind === "income" ? "Lavender" : "Peach",
              };
              await CategoriesStore.upsert(newCat);
              cat = CategoriesStore.all().find(c => c.name === name) || newCat;
              return cat;
            } catch (e) {
              // Fallback: refresh and find by name (handles server-side unique constraint)
              await CategoriesStore.refresh().catch(() => {});
              cat = CategoriesStore.all().find(c => c.name === name);
              if (cat) return cat;
              throw e;
            }
          };
          const adjCat = await ensureAdjustmentCategory(adjType);

          // 3) Create adjustment transaction to reach new balance
          const todayISO = new Date().toISOString().slice(0, 10);
          await TransactionsStore.add({
            id: newId(),
            date: todayISO,
            description: `Ajuste de balance: ${prevBalance.toFixed(2)} → ${nextBalance.toFixed(2)}`,
            categoryId: adjCat.id,
            accountId: editingAccount.id,
            amount: Math.abs(delta),
            type: adjType,
          });

          // Ensure global stores reflect the latest balances for KPIs
          await AccountsStore.refresh().catch(() => {});
          toast({
            title: "Account Adjusted",
            description: `Se registró un ajuste de ${Math.abs(delta).toFixed(2)} (${adjType === 'income' ? 'ingreso' : 'gasto'}).`,
          });
        } else {
          // No balance change: simple metadata update
          const updated: Account = {
            ...editingAccount,
            name: formData.name,
            currency: formData.currency,
            balance: prevBalance,
          };
          await AccountsStore.upsert(updated);
          await AccountsStore.refresh().catch(() => {});
          toast({
            title: "Account Updated",
            description: `${formData.name} has been updated successfully.`,
          });
        }
      } else {
        const newAccount: Account = {
          id: newId(),
          name: formData.name,
          currency: formData.currency,
          balance: parseFloat(formData.balance),
        };
        await AccountsStore.upsert(newAccount);
        await AccountsStore.refresh().catch(() => {});
        toast({
          title: "Account Created",
          description: `${formData.name} has been created successfully.`,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      setDeletingId(accountId);
      await AccountsStore.remove(accountId);
      await AccountsStore.refresh().catch(() => {});
      toast({
        title: "Account Deleted",
        description: "The account has been removed.",
      });
    } finally {
      setDeletingId(null);
    }
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingAccount ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    editingAccount ? "Update" : "Create"
                  )}
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
                disabled={deletingId === account.id}
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDeleteId(account.id)}
                className="flex-1 text-destructive hover:bg-destructive/10"
                disabled={deletingId === account.id}
              >
                {deletingId === account.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => setConfirmDeleteId(open ? confirmDeleteId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account and remove its data from the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingId}
              onClick={async () => {
                if (!confirmDeleteId) return;
                await handleDelete(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
            >
              {deletingId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};