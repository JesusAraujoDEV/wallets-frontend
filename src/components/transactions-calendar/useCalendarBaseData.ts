import { useEffect, useState } from "react";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import type { Account, Category, Transaction } from "@/lib/types";

// Loads accounts/categories/local fallback transactions and keeps them in sync with the local store.
export function useCalendarBaseData() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fallbackLocalTx, setFallbackLocalTx] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadBase = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setFallbackLocalTx(TransactionsStore.all());
    };
    loadBase();
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    TransactionsStore.refresh().catch(() => {});
    const off = onDataChange(loadBase);
    return off;
  }, []);

  return { accounts, categories, fallbackLocalTx };
}
