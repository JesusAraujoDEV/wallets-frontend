import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import type { ComparativeMoMResponse, ComparativeMoMIncomeResponse } from "@/lib/stats";

function daysBetween(from?: string, to?: string): number {
  if (!from || !to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

export function StatisticsOverviewCards({ expense, income }: { expense: ComparativeMoMResponse; income: ComparativeMoMIncomeResponse }) {
  const { t } = useTranslation();
  const days = daysBetween(expense.summary.current_period_start, expense.summary.current_period_end);
  const avgDailySpend = days > 0 ? expense.summary.current_total / days : 0;
  const avgDailyIncome = days > 0 ? income.summary.current_total / days : 0;
  const netCurrent = income.summary.current_total - expense.summary.current_total;
  const netPrevious = income.summary.previous_total - expense.summary.previous_total;
  const netChange = netCurrent - netPrevious;
  const topMover = expense.categories_comparison[0];

  const stats = [
    { label: t("statistics.daysCompared"), value: String(days) },
    { label: t("statistics.avgDailySpend"), value: `$${avgDailySpend.toFixed(2)}` },
    { label: t("statistics.avgDailyIncome"), value: `$${avgDailyIncome.toFixed(2)}` },
    {
      label: t("statistics.netChange"),
      value: `${netChange >= 0 ? "+" : ""}$${netChange.toFixed(2)}`,
      className: netChange >= 0 ? "text-green-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-4 shadow-md border-0">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className={`text-xl font-bold ${s.className ?? ""}`}>{s.value}</div>
        </Card>
      ))}
      {topMover ? (
        <Card className="col-span-2 p-4 shadow-md border-0 lg:col-span-4">
          <div className="text-xs text-muted-foreground">{t("statistics.biggestMover")}</div>
          <div className="text-lg font-semibold">{topMover.category}</div>
          <div className="text-sm text-muted-foreground">
            ${Number((topMover as any).current ?? (topMover as any).current_amount ?? 0).toFixed(2)} ({(topMover.delta_percent * 100).toFixed(1)}%)
          </div>
        </Card>
      ) : null}
    </div>
  );
}
