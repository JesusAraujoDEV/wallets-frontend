import { useEffect, useState } from "react";
import {
  fetchNetCashFlow, fetchSpendingHeatmap, fetchExpenseVolatility, fetchComparativeMoM,
  fetchMonthlyForecast, fetchIncomeHeatmap, fetchIncomeVolatility, fetchComparativeMoMIncome,
} from "@/lib/stats";
import { fetchBudgetsStatus } from "@/lib/budgets";
import { filterHeatmap, filterByCategoryName, buildAllowedNameFn, sumMonthlyBudgets, toBudgetChartData } from "./dashboardChartFilters";
import type { BudgetData } from "@/components/BudgetComparisonChart";

const EMPTY_MOM = { summary: { current_total: 0, total_delta_percent: 0, total_delta_usd: 0 }, categories: [] as any[] };
const EMPTY_HEATMAP = { categories: [] as string[], weekdays: [] as string[], data_points: [] as any[] };
const EMPTY_FORECAST = { budget_total: 0, current_spending_mtd: 0, projected_total_spending: 0, projected_over_under: 0 };

export function useDashboardCharts({
  selectedAccount, monthKey, selectedGroupNumber, categoriesLength,
  visibleExpenseCategoryNames, selectedExpenseCategoryNames, selectedExpenseCats,
  visibleIncomeCategoryNames, selectedIncomeCategoryNames, selectedIncomeCats,
}: {
  selectedAccount: string; monthKey: string; selectedGroupNumber: number | null; categoriesLength: number;
  visibleExpenseCategoryNames: Set<string>; selectedExpenseCategoryNames: Set<string>; selectedExpenseCats: string[];
  visibleIncomeCategoryNames: Set<string>; selectedIncomeCategoryNames: Set<string>; selectedIncomeCats: string[];
}) {
  const [netFlowData, setNetFlowData] = useState<{ summary?: any; series: any[] }>({ summary: undefined, series: [] });
  const [heatmapData, setHeatmapData] = useState(EMPTY_HEATMAP);
  const [volatilityData, setVolatilityData] = useState<any[]>([]);
  const [momData, setMomData] = useState(EMPTY_MOM);
  const [incomeHeatmapData, setIncomeHeatmapData] = useState(EMPTY_HEATMAP);
  const [incomeVolatilityData, setIncomeVolatilityData] = useState<any[]>([]);
  const [incomeMomData, setIncomeMomData] = useState(EMPTY_MOM);
  const [forecastData, setForecastData] = useState(EMPTY_FORECAST);
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);

  useEffect(() => {
    let alive = true;
    const groupId = selectedGroupNumber ?? undefined;
    const accountId = selectedAccount !== 'all' ? selectedAccount : undefined;
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    (async () => {
      try {
        // Fetched first: its monthly total feeds fetchMonthlyForecast's budget_total below.
        const budgets = await fetchBudgetsStatus();

        const [net, heat, vol, mom, fc, incHeat, incVol, incMom] = await Promise.all([
          fetchNetCashFlow({ accountId, fromDate, toDate, timeUnit: 'month', groupId }),
          fetchSpendingHeatmap({ accountId, fromDate, toDate, groupId }),
          fetchExpenseVolatility({ accountId, fromDate, toDate, topN: 8, groupId }),
          fetchComparativeMoM({ accountId, date: toDate, groupId }),
          fetchMonthlyForecast({ accountId, date: now.toISOString().slice(0, 10), groupId, budget_total: sumMonthlyBudgets(budgets) }),
          fetchIncomeHeatmap({ accountId, fromDate, toDate, groupId }),
          fetchIncomeVolatility({ accountId, fromDate, toDate, topN: 8, groupId }),
          fetchComparativeMoMIncome({ accountId, date: toDate, groupId }),
        ]);
        if (!alive) return;

        const allowedExpense = buildAllowedNameFn(visibleExpenseCategoryNames, selectedExpenseCategoryNames);
        const allowedIncome = buildAllowedNameFn(visibleIncomeCategoryNames, selectedIncomeCategoryNames);

        setNetFlowData({ summary: net?.summary, series: net?.time_series || [] });
        setHeatmapData(filterHeatmap(heat, allowedExpense));
        setVolatilityData(filterByCategoryName(vol?.categories_data, allowedExpense));
        setMomData({ summary: mom?.summary || EMPTY_MOM.summary, categories: filterByCategoryName(mom?.categories_comparison, allowedExpense) });
        setForecastData(fc || EMPTY_FORECAST);
        setIncomeHeatmapData(filterHeatmap(incHeat, allowedIncome));
        setIncomeVolatilityData(filterByCategoryName(incVol?.categories_data, allowedIncome));
        setIncomeMomData({ summary: incMom?.summary || EMPTY_MOM.summary, categories: filterByCategoryName(incMom?.categories_comparison, allowedIncome) });
        setBudgetData(toBudgetChartData(budgets));
      } catch (err) {
        if (!alive) return;
        console.warn('stats fetch failed', err);
      }
    })();
    return () => { alive = false; };
  }, [selectedAccount, monthKey, visibleExpenseCategoryNames, selectedExpenseCats.join(','), visibleIncomeCategoryNames, selectedIncomeCats.join(','), categoriesLength, selectedGroupNumber]);

  return { netFlowData, heatmapData, volatilityData, momData, incomeHeatmapData, incomeVolatilityData, incomeMomData, forecastData, budgetData };
}
