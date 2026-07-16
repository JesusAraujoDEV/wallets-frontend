import { useState } from "react";
import { TransactionsStore } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import type { Transaction } from "@/lib/types";

export function useTransactionEditForm(refetch: () => Promise<void>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "", type: "expense" as "income" | "expense", amount: "", categoryId: "", description: "", date: "",
  });

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      accountId: tx.accountId, type: tx.type, amount: tx.amount.toString(),
      categoryId: tx.categoryId, description: tx.description, date: tx.date,
    });
    setIsDialogOpen(true);
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
      accountId: formData.accountId, type: formData.type, amount: parseFloat(formData.amount),
      categoryId: formData.categoryId, description: formData.description, date: formData.date || editingTx.date,
    };
    try {
      setSaving(true);
      await TransactionsStore.update(next);
      await refetch();
      setIsDialogOpen(false);
      setEditingTx(null);
      toast({ title: "Transaction Updated", description: "Your changes have been saved." });
    } finally {
      setSaving(false);
    }
  };

  return { isDialogOpen, setIsDialogOpen, formData, setFormData, saving, handleEdit, handleUpdate };
}
