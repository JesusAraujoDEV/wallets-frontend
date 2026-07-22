// Pure re-filtering helpers shared by the expense and income chart-fetch effects:
// the stats API returns categories/data_points indexed by position, so filtering
// down to "visible" categories means reindexing, not just filtering the array.
import type { BudgetStatus } from "@/lib/types";
import type { BudgetData } from "@/components/BudgetComparisonChart";

type HeatmapPoint = { category_idx: number; day_idx: number; amount: number };
type Heatmap = { categories: string[]; weekdays: string[]; data_points: HeatmapPoint[] };

// Only "monthly" budgets are summed — yearly/one-time budgets would overstate
// a per-month forecast comparison.
export function sumMonthlyBudgets(budgets: BudgetStatus[]): number {
  return budgets.filter(b => b.period === 'monthly').reduce((sum, b) => sum + b.budgeted, 0);
}

export function toBudgetChartData(budgets: BudgetStatus[]): BudgetData[] {
  return budgets.map(b => ({ category: b.category.name, budget: b.budgeted, actual: b.spent }));
}

export function filterHeatmap(raw: Heatmap | undefined, allowedName: (name: string) => boolean): Heatmap {
  const rawCategories = raw?.categories || [];
  const rawPoints = raw?.data_points || [];
  const oldIdxToNew = new Map<number, number>();
  const categories: string[] = [];
  rawCategories.forEach((name, idx) => {
    if (allowedName(name)) {
      oldIdxToNew.set(idx, categories.length);
      categories.push(name);
    }
  });
  const data_points = rawPoints
    .filter(p => oldIdxToNew.has(p.category_idx))
    .map(p => ({ ...p, category_idx: oldIdxToNew.get(p.category_idx)! }));
  return { categories, weekdays: raw?.weekdays || [], data_points };
}

export function filterByCategoryName<T extends { category: string }>(rows: T[] | undefined, allowedName: (name: string) => boolean): T[] {
  return (rows || []).filter((r) => allowedName(r.category));
}

export function buildAllowedNameFn(visibleNames: Set<string>, selectedNames: Set<string>) {
  return (name: string) => {
    if (!visibleNames.has(name)) return false;
    if (selectedNames.size > 0 && !selectedNames.has(name)) return false;
    return true;
  };
}
