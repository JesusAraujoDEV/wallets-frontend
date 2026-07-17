import { useMemo } from "react";
import type { Dayjs } from "dayjs";
import type { CalendarDay, CalendarMode } from "./types";

interface UseCalendarGridArgs {
  monthStart: Dayjs;
  mode: CalendarMode;
  dailyIncome: Record<string, number>;
  dailyExpense: Record<string, number>;
}

// Builds the calendar grid cells for the current month plus the color-intensity function used to paint them.
export function useCalendarGrid({ monthStart, mode, dailyIncome, dailyExpense }: UseCalendarGridArgs) {
  const dailyTotals = useMemo(() => {
    if (mode === 'income') return dailyIncome;
    if (mode === 'expense') return dailyExpense;
    // balance
    const keys = new Set([...Object.keys(dailyIncome), ...Object.keys(dailyExpense)]);
    const out: Record<string, number> = {};
    keys.forEach(k => { out[k] = (Number(dailyIncome[k] || 0)) - (Number(dailyExpense[k] || 0)); });
    return out;
  }, [mode, dailyIncome, dailyExpense]);

  const firstDayOfMonth = monthStart.day(); // 0..6 (Sunday..Saturday)
  const daysInMonth = monthStart.daysInMonth();
  const days: Array<CalendarDay | null> = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = monthStart.date(d).format('YYYY-MM-DD');
    const raw = dailyTotals[date];
    const totalUsd = typeof raw === 'number' && isFinite(raw) ? raw : 0;
    const inc = Number(dailyIncome[date] || 0);
    const exp = Number(dailyExpense[date] || 0);
    days.push({ date, totalUsd, income: inc, expense: exp });
  }

  const maxIncome = Math.max(0, ...days.map(x => (x ? x.income : 0)));
  const maxExpense = Math.max(0, ...days.map(x => (x ? x.expense : 0)));
  const maxBalanceAbs = Math.max(0, ...days.map(x => (x ? Math.abs((x.income || 0) - (x.expense || 0)) : 0)));

  const colorFor = (item: CalendarDay) => {
    const { income, expense } = item;
    if (mode === 'income') {
      if (income === 0) return '#ffffff';
      const t = Math.max(0, Math.min(1, income / (maxIncome || income)));
      const l = 96 - t * 50;
      return `hsl(160 70% ${l}%)`;
    }
    if (mode === 'expense') {
      if (expense === 0) return '#ffffff';
      const t = Math.max(0, Math.min(1, expense / (maxExpense || expense)));
      const l = 96 - t * 50;
      return `hsl(0 70% ${l}%)`;
    }
    // balance mode
    if (income === 0 && expense === 0) return '#ffffff';
    const bal = income - expense;
    const t = Math.max(0, Math.min(1, Math.abs(bal) / (maxBalanceAbs || Math.abs(bal))));
    const l = 96 - t * 50;
    return bal >= 0 ? `hsl(160 70% ${l}%)` : `hsl(0 70% ${l}%)`;
  };

  return { days, dailyTotals, colorFor };
}
