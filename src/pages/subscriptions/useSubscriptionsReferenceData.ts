import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { CategoriesStore, AccountsStore, onDataChange } from "@/lib/storage";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";
import type { Account, Category, Debt } from "@/lib/types";

export function useSubscriptionsReferenceData() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const debtsQuery = useQuery({ queryKey: DEBTS_QUERY_KEY, queryFn: fetchDebts });
  const activeDebts = (debtsQuery.data ?? []).filter((d: Debt) => d.status !== "paid");

  useEffect(() => {
    async function loadReferenceData() {
      await Promise.all([AccountsStore.refresh(), CategoriesStore.refresh()]);
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    }

    loadReferenceData().catch((error) => {
      toast({
        title: "No se pudieron cargar cuentas y categorías",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    });

    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
  }, [toast]);

  return { accounts, categories, activeDebts };
}
