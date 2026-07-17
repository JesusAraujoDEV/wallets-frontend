import { useEffect, useState } from "react";
import { AccountsStore, CategoriesStore, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";

export function useDebtsReferenceData() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([AccountsStore.refresh(), CategoriesStore.refresh()])
      .then(() => {
        setAccounts(AccountsStore.all());
        setCategories(CategoriesStore.all());
      })
      .catch(() => {});
    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
  }, []);

  return { accounts, categories };
}
