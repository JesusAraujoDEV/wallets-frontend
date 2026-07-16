import { useEffect, useState } from "react";
import { fetchRateHistory } from "@/lib/rates";

// One batched /exchange-rates/history request for the whole visible date range,
// instead of one request per date group (was the app's biggest N+1: a request
// per unique day, sometimes dozens on a single page load).
export function useDailyRates(dates: string[], resetKey: unknown) {
  const [vesRateByDate, setVesRateByDate] = useState<Record<string, number | null>>({});

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
        const byDate = new Map(history.map((r) => [r.date, r.usdRate]));
        const updates: Record<string, number | null> = {};
        for (const d of dates) updates[d] = byDate.get(d) ?? null;
        setVesRateByDate((prev) => ({ ...prev, ...updates }));
      } catch {
        // leave missing dates as undefined; UI shows "…" for those
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datesKey]);

  return vesRateByDate;
}
