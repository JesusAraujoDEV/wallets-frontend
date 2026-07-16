import { useEffect, useState } from "react";
import { AuthApi } from "@/lib/auth";
import { AccountsStore, CategoriesStore, TransactionsStore, fetchCategoryGroups, onDataChange } from "@/lib/storage";
import type { Account, Category, CategoryGroup, Transaction, AuthUser } from "@/lib/types";

export function useDashboardData() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);

  useEffect(() => {
    const load = () => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
      setTransactions(TransactionsStore.all());
    };
    load();
    AccountsStore.refresh().catch(() => {});
    CategoriesStore.refresh().catch(() => {});
    TransactionsStore.refresh().catch(() => {});
    const off = onDataChange(load);
    return off;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchCategoryGroups();
        if (alive) setGroups(list);
      } catch {
        if (alive) setGroups([]);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await AuthApi.me();
        if (alive) setAuthUser(response.user);
      } catch {
        if (alive) setAuthUser(null);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { accounts, categories, transactions, authUser, groups };
}
