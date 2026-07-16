import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDisplayCurrency, type DisplayCurrency } from "@/lib/displayCurrency";
import type { ExchangeRate } from "@/lib/rates";

function fmt(value: number | null | undefined) {
  if (value == null || !isFinite(value)) return "—";
  return value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

const CARDS: { currency: DisplayCurrency; labelKey: string; accent: string }[] = [
  { currency: "USD", labelKey: "rates.usd", accent: "text-emerald-600" },
  { currency: "EUR", labelKey: "rates.eur", accent: "text-blue-600" },
  { currency: "USDT", labelKey: "rates.usdt", accent: "text-amber-600" },
];

export function RateCurrentCards({ rate, loading }: { rate: ExchangeRate | undefined; loading: boolean }) {
  const { t } = useTranslation();
  const [preferred] = useDisplayCurrency();
  const valueFor = { USD: rate?.usdRate, EUR: rate?.eurRate, USDT: rate?.usdtRate } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CARDS.map((c) => (
        <Card key={c.labelKey} className={cn("shadow-md", c.currency === preferred ? "border-primary ring-1 ring-primary/40" : "border-0")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {c.currency} ({t(c.labelKey)})
              {c.currency === preferred ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">{t("rates.yourRate")}</span> : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${c.accent}`}>{loading ? "…" : fmt(valueFor[c.currency])}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("rates.perUnit")}</p>
          </CardContent>
        </Card>
      ))}
      {rate ? (
        <p className="md:col-span-3 text-xs text-muted-foreground">
          {t("rates.referenceDate")}: {rate.date} {rate.source === "fallback" ? t("rates.fallbackNote") : ""}
        </p>
      ) : null}
    </div>
  );
}
