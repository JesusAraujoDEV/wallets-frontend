import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchBudgetsStatus } from "@/lib/budgets";
import { CategoriesStore } from "@/lib/storage";
import type { BudgetStatus, Category } from "@/lib/types";

export function useBudgetsData() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBudgetsData = useCallback(async () => {
    setLoading(true);
    try {
      await CategoriesStore.refresh();
      setCategories(CategoriesStore.all());
      const status = await fetchBudgetsStatus();
      setBudgets(status);
    } catch (error) {
      toast({
        title: "No se pudieron cargar los presupuestos",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadBudgetsData();
  }, [loadBudgetsData]);

  return { budgets, categories, loading, loadBudgetsData };
}
