import { useEffect, useState } from "react";
import { fetchRateHistory } from "@/lib/rates";
import { useDisplayCurrency, type DisplayCurrency } from "@/lib/displayCurrency";

function rateForCurrency(rate: { usdRate: number; eurRate: number; usdtRate: number | null }, currency: DisplayCurrency): number | null {
  if (currency === "EUR") return rate.eurRate || null;
  if (currency === "USDT") return rate.usdtRate ?? null;
  return rate.usdRate || null;
}

// One batched /exchange-rates/history request for the whole visible date range,
// instead of one request per date group (was the app's biggest N+1: a request
// per unique day, sometimes dozens on a single page load).
export function useDailyRates(dates: string[], resetKey: unknown) {
  const [vesRateByDate, setVesRateByDate] = useState<Record<string, number | null>>({});
  const [displayCurrency] = useDisplayCurrency();

  useEffect(() => {
    setVesRateByDate({});
  }, [resetKey]);

  const datesKey = [...dates].sort().join(',');

  useEffect(() => {
    if (dates.length === 0) return;
    let mounted = true;
    (async () => {
      const sorted = [...dates].sort();
      try {
        const history = await fetchRateHistory({ from: sorted[0], to: sorted[sorted.length - 1] });
        if (!mounted) return;
        const updates: Record<string, number | null> = {};
        for (const d of dates) {
          const r = history.find((h) => h.date === d);
          updates[d] = r ? rateForCurrency(r, displayCurrency) : null;
        }
        setVesRateByDate((prev) => ({ ...prev, ...updates }));
      } catch {
        // leave missing dates as undefined; UI shows "…" for those
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datesKey, displayCurrency]);

  return vesRateByDate;
}
