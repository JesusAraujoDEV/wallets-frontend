import { useEffect, useMemo, useState } from "react";
import { fetchComparativeMoM, fetchComparativeMoMIncome, type ComparativeMoMResponse, type ComparativeMoMIncomeResponse } from "@/lib/stats";

export type PeriodPreset = "mtd_vs_last_month" | "mtd_vs_last_year" | "pick_two_months" | "custom";
export type MonthValue = { year: number; month: number }; // month: 0-11

const EMPTY: ComparativeMoMResponse = { summary: { current_total: 0, previous_total: 0, total_delta_percent: 0, total_delta_usd: 0 }, categories_comparison: [] };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const lastOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

function computeRangesForPreset(
  preset: PeriodPreset,
  custom: { currentFrom: string; currentTo: string; previousFrom: string; previousTo: string },
  months: { current: MonthValue; previous: MonthValue },
) {
  if (preset === "custom") return custom;
  if (preset === "pick_two_months") {
    const cur = new Date(months.current.year, months.current.month, 1);
    const prev = new Date(months.previous.year, months.previous.month, 1);
    return {
      currentFrom: iso(firstOfMonth(cur)), currentTo: iso(lastOfMonth(cur)),
      previousFrom: iso(firstOfMonth(prev)), previousTo: iso(lastOfMonth(prev)),
    };
  }
  const today = new Date();
  if (preset === "mtd_vs_last_year") {
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return {
      currentFrom: iso(firstOfMonth(today)), currentTo: iso(today),
      previousFrom: iso(firstOfMonth(lastYear)), previousTo: iso(lastYear),
    };
  }
  return { currentFrom: "", currentTo: "", previousFrom: "", previousTo: "" }; // mtd_vs_last_month: let the API apply its own MTD default
}

export function useStatisticsComparison({ accountId, groupId }: { accountId?: string; groupId?: number }) {
  const now = new Date();
  const [preset, setPreset] = useState<PeriodPreset>("mtd_vs_last_month");
  const [custom, setCustom] = useState({ currentFrom: "", currentTo: "", previousFrom: "", previousTo: "" });
  const [months, setMonths] = useState({
    current: { year: now.getFullYear(), month: now.getMonth() },
    previous: { year: now.getFullYear(), month: now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1 },
  });
  const [expense, setExpense] = useState<ComparativeMoMResponse>(EMPTY);
  const [income, setIncome] = useState<ComparativeMoMIncomeResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  const ranges = useMemo(() => computeRangesForPreset(preset, custom, months), [preset, custom, months]);
  const customIncomplete = preset === "custom" && (!ranges.currentFrom || !ranges.currentTo || !ranges.previousFrom || !ranges.previousTo);

  useEffect(() => {
    if (customIncomplete) return;
    let alive = true;
    setLoading(true);
    const params = { accountId, groupId, date: preset === "mtd_vs_last_month" ? iso(new Date()) : undefined, ...ranges };
    Promise.all([fetchComparativeMoM(params), fetchComparativeMoMIncome(params)])
      .then(([exp, inc]) => { if (alive) { setExpense(exp); setIncome(inc); } })
      .catch((err) => { console.warn("statistics comparison fetch failed", err); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [accountId, groupId, preset, ranges.currentFrom, ranges.currentTo, ranges.previousFrom, ranges.previousTo, customIncomplete]);

  return { preset, setPreset, custom, setCustom, months, setMonths, expense, income, loading, customIncomplete };
}
