import { useEffect, useRef, useState } from "react";
import { AccountsStore, CategoriesStore, TransactionsStore, onDataChange } from "@/lib/storage";
import type { Account, Category, Transaction } from "@/lib/types";

// Loads accounts/categories/local fallback transactions and keeps them in sync with the local store.
// Uses a single refresh pass on mount and subscribes to changes without causing re-render cascades.
export function useCalendarBaseData() {
  const [accounts, setAccounts] = useState<Account[]>(() => AccountsStore.all());
  const [categories, setCategories] = useState<Category[]>(() => CategoriesStore.all());
  const [fallbackLocalTx, setFallbackLocalTx] = useState<Transaction[]>(() => TransactionsStore.all());
  const refreshedRef = useRef(false);

  useEffect(() => {
    const loadBase = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setFallbackLocalTx(TransactionsStore.all());
    };

    // Only refresh from API once per component lifetime
    if (!refreshedRef.current) {
      refreshedRef.current = true;
      AccountsStore.refresh().catch(() => {});
      CategoriesStore.refresh().catch(() => {});
      TransactionsStore.refresh().catch(() => {});
    }

    const off = onDataChange(loadBase);
    return off;
  }, []);

  return { accounts, categories, fallbackLocalTx };
}
