import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPeriodLabel } from "@/lib/formatPeriodLabel";

export interface ComparativeMoMProps {
  summary: {
    current_total: number;
    total_delta_percent: number;
    total_delta_usd: number;
    current_period_start?: string;
    current_period_end?: string;
    previous_period_start?: string;
    previous_period_end?: string;
  };
  categories: Array<{ category: string; current: number; previous: number; delta_percent: number }>;
}

export function ComparativeMoM({ summary, categories }: ComparativeMoMProps) {
  const { t, i18n } = useTranslation();
  const currentLabel = formatPeriodLabel(summary.current_period_start, summary.current_period_end, i18n.language) || t("dashboard.mom.current");
  const previousLabel = formatPeriodLabel(summary.previous_period_start, summary.previous_period_end, i18n.language) || t("dashboard.mom.previous");
  const totalDeltaRaw = Number(summary?.total_delta_percent ?? 0);
  const positive = totalDeltaRaw > 0; // more spending is red
  const totalDeltaPct = totalDeltaRaw * 100; // convert fraction to percent
  const totalDeltaUsd = Number(summary?.total_delta_usd ?? 0);
  const currentTotal = Number(summary?.current_total ?? 0);
  return (
    <Card className="p-6 shadow-md border-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{t("dashboard.mom.titleExpense")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.mom.comparing", { current: currentLabel, previous: previousLabel })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${currentTotal.toFixed(2)}</div>
          <div className={`text-sm ${positive ? 'text-red-600' : 'text-green-600'}`}>
            {positive ? '+' : ''}{totalDeltaPct.toFixed(1)}% ({totalDeltaUsd >= 0 ? '+' : ''}${totalDeltaUsd.toFixed(2)})
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("dashboard.mom.category")}</TableHead>
            <TableHead>{t("dashboard.mom.currentExpense")}</TableHead>
            <TableHead>{t("dashboard.mom.previousExpense")}</TableHead>
            <TableHead>{t("dashboard.mom.changePercent")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((r, i) => {
            const rawCurrent = Number((r as any).current ?? (r as any).current_amount ?? 0);
            const rawPrevious = Number((r as any).previous ?? (r as any).previous_amount ?? 0);
            const rawDelta = Number((r as any).delta_percent ?? 0);
            const pct = rawDelta * 100;
            const cls = pct > 0 ? 'text-red-600' : pct < 0 ? 'text-green-600' : '';
            return (
              <TableRow key={i}>
                <TableCell className="font-medium">{(r as any).category}</TableCell>
                <TableCell>${rawCurrent.toFixed(2)}</TableCell>
                <TableCell>${rawPrevious.toFixed(2)}</TableCell>
                <TableCell className={cls}>{pct > 0 ? '+' : ''}{pct.toFixed(1)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
