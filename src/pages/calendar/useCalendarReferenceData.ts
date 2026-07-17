import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AccountsStore, CategoriesStore, onDataChange } from "@/lib/storage";
import type { Account, Category } from "@/lib/types";

export function useCalendarReferenceData() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadReferenceData() {
      await Promise.all([AccountsStore.refresh(), CategoriesStore.refresh()]);
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    }

    loadReferenceData().catch(() => {
      toast({
        title: "No se pudieron cargar cuentas y categorías",
        description: "Intenta nuevamente.",
        variant: "destructive",
      });
    });

    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
  }, [toast]);

  return { accounts, categories };
}
