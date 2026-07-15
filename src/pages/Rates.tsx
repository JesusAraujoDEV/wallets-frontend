import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { RateCurrentCards } from "@/components/RateCurrentCards";
import { RateHistoryChart } from "@/components/RateHistoryChart";
import { RateHistoryTable } from "@/components/RateHistoryTable";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { useCurrentExchangeRate, useExchangeRateHistory } from "@/lib/rates";

const RANGE_OPTIONS = [
  { label: "30 días", days: 30 },
  { label: "90 días", days: 90 },
  { label: "180 días", days: 180 },
  { label: "1 año", days: 365 },
];

function daysAgoISO(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function Rates() {
  const [rangeDays, setRangeDays] = useState(90);
  const from = useMemo(() => daysAgoISO(rangeDays), [rangeDays]);
  const to = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const current = useCurrentExchangeRate();
  const history = useExchangeRateHistory({ from, to });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasas de Cambio</h1>
          <p className="text-sm text-muted-foreground">Dólar, Euro y USDT oficiales, con histórico diario.</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Mostrar equivalencias en</p>
          <CurrencyToggle />
        </div>
      </div>

      <RateCurrentCards rate={current.data} loading={current.isLoading} />

      <div className="flex items-center gap-2">
        {RANGE_OPTIONS.map((opt) => (
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
