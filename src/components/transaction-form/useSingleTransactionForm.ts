import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { TransactionsStore, newId } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";

export function useSingleTransactionForm({ accounts, categories, onSubmitted }: {
  accounts: Account[];
  categories: Category[];
  onSubmitted?: () => void;
}) {
  const [account, setAccount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [singleCommission, setSingleCommission] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (category && !filteredCategories.some((c) => c.id === category)) {
      setCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !amount || !category) {
      toast({ title: "Missing Information", description: "Please fill in all required fields, including the account.", variant: "destructive" });
      return;
    }

    const selectedAccount = accounts.find((acc) => acc.id === account);
    const selectedCategory = categories.find((cat) => cat.id === category);

    try {
      setSubmitting(true);
      await TransactionsStore.add({
        id: newId(),
        date: date || new Date().toISOString().slice(0, 10),
        description: description || (type === "income" ? "Income" : "Expense"),
        categoryId: selectedCategory?.id || "",
        accountId: selectedAccount?.id || "",
        amount: parseFloat(amount),
        type,
      }, { commission: singleCommission ? parseFloat(singleCommission) : undefined });
      toast({
        title: "Transaction Added",
        description: `${type === "income" ? "Income" : "Expense"} of $${amount}${singleCommission ? ` (+$${Number(singleCommission).toFixed(2)} commission)` : ""} recorded to ${selectedAccount?.name}.`,
      });

      setAccount("");
      setAmount("");
      setSingleCommission("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      onSubmitted?.();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    account, setAccount, type, setType, amount, setAmount,
    singleCommission, setSingleCommission, category, setCategory,
    description, setDescription, date, setDate, submitting,
    filteredCategories, handleSubmit,
  };
}
