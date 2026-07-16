import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RateCurrentCards } from "@/components/RateCurrentCards";
import { RateHistoryChart } from "@/components/RateHistoryChart";
import { RateHistoryTable } from "@/components/RateHistoryTable";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { useCurrentExchangeRate, useExchangeRateHistory } from "@/lib/rates";

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Rates() {
  const { t } = useTranslation();
  const [rangeDays, setRangeDays] = useState(90);
  const from = useMemo(() => daysAgoISO(rangeDays), [rangeDays]);
  const to = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const current = useCurrentExchangeRate();
  const history = useExchangeRateHistory({ from, to });

  const rangeOptions = [
    { label: t("rates.days30"), days: 30 },
    { label: t("rates.days90"), days: 90 },
    { label: t("rates.days180"), days: 180 },
    { label: t("rates.year1"), days: 365 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("rates.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("rates.subtitle")}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("rates.showIn")}</p>
          <CurrencyToggle />
        </div>
      </div>

      <RateCurrentCards rate={current.data} loading={current.isLoading} />

      <div className="flex items-center gap-2">
        {rangeOptions.map((opt) => (
          <Button
            key={opt.days}
            size="sm"
            variant={rangeDays === opt.days ? "default" : "outline"}
            onClick={() => setRangeDays(opt.days)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <RateHistoryChart data={history.data ?? []} loading={history.isLoading} />
      <RateHistoryTable data={history.data ?? []} />
    </div>
  );
}
