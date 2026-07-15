import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchRateByDate } from "@/lib/rates";

export function useBcvTransferRate({ hasDifferentCurrencies, isUsdVesPair, transferDate }: {
  hasDifferentCurrencies: boolean;
  isUsdVesPair: boolean;
  transferDate: string;
}) {
  const [bcvLoading, setBcvLoading] = useState(false);
  const [bcvOfficialRate, setBcvOfficialRate] = useState<number | null>(null);
  const [bcvSourceDate, setBcvSourceDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadBcvRate = async () => {
      if (!hasDifferentCurrencies || !isUsdVesPair) {
        setBcvOfficialRate(null);
        setBcvSourceDate(null);
        return;
      }

      try {
        setBcvLoading(true);
        const rate = await fetchRateByDate(transferDate);
        if (cancelled) return;
        if (!rate || !isFinite(rate.usdRate) || rate.usdRate <= 0) {
          setBcvOfficialRate(null);
          setBcvSourceDate(null);
          toast({
            title: "BCV unavailable",
            description: "No BCV rate available for the selected date.",
            variant: "destructive",
          });
          return;
        }

        setBcvOfficialRate(rate.usdRate);
        setBcvSourceDate(rate.date);
      } catch {
        if (!cancelled) {
          setBcvOfficialRate(null);
          setBcvSourceDate(null);
        }
      } finally {
        if (!cancelled) setBcvLoading(false);
      }
    };

    void loadBcvRate();

    return () => {
      cancelled = true;
    };
  }, [hasDifferentCurrencies, isUsdVesPair, transferDate]);

  return { bcvLoading, bcvOfficialRate, bcvSourceDate, setBcvSourceDate };
}
