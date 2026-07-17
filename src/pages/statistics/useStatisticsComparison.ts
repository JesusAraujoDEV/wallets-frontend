import { useEffect, useMemo, useState } from "react";
import { fetchComparativeMoM, fetchComparativeMoMIncome, type ComparativeMoMResponse, type ComparativeMoMIncomeResponse } from "@/lib/stats";

export type PeriodPreset = "mtd_vs_last_month" | "mtd_vs_last_year" | "custom";

const EMPTY: ComparativeMoMResponse = { summary: { current_total: 0, previous_total: 0, total_delta_percent: 0, total_delta_usd: 0 }, categories_comparison: [] };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

function computeRangesForPreset(preset: PeriodPreset, custom: { currentFrom: string; currentTo: string; previousFrom: string; previousTo: string }) {
  if (preset === "custom") return custom;
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
  const [preset, setPreset] = useState<PeriodPreset>("mtd_vs_last_month");
  const [custom, setCustom] = useState({ currentFrom: "", currentTo: "", previousFrom: "", previousTo: "" });
  const [expense, setExpense] = useState<ComparativeMoMResponse>(EMPTY);
  const [income, setIncome] = useState<ComparativeMoMIncomeResponse>(EMPTY);
  const [loading, setLoading] = useState(false);

  const ranges = useMemo(() => computeRangesForPreset(preset, custom), [preset, custom]);
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

  return { preset, setPreset, custom, setCustom, expense, income, loading, customIncomplete };
}
