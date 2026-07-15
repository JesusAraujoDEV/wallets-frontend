import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDisplayCurrency, type DisplayCurrency } from "@/lib/displayCurrency";
import type { ExchangeRate } from "@/lib/rates";

function fmt(value: number | null | undefined) {
  if (value == null || !isFinite(value)) return "—";
  return value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

const CARDS: { currency: DisplayCurrency; label: string; accent: string }[] = [
  { currency: "USD", label: "USD (Dólar BCV)", accent: "text-emerald-600" },
  { currency: "EUR", label: "EUR (Euro BCV)", accent: "text-blue-600" },
  { currency: "USDT", label: "USDT (Binance)", accent: "text-amber-600" },
];

export function RateCurrentCards({ rate, loading }: { rate: ExchangeRate | undefined; loading: boolean }) {
  const [preferred] = useDisplayCurrency();
  const valueFor = { USD: rate?.usdRate, EUR: rate?.eurRate, USDT: rate?.usdtRate } as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CARDS.map((c) => (
        <Card key={c.label} className={cn("shadow-md", c.currency === preferred ? "border-primary ring-1 ring-primary/40" : "border-0")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {c.label}
              {c.currency === preferred ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">Tu tasa</span> : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${c.accent}`}>{loading ? "…" : fmt(valueFor[c.currency])}</div>
            <p className="text-xs text-muted-foreground mt-1">Bs. por unidad</p>
          </CardContent>
        </Card>
      ))}
      {rate ? (
        <p className="md:col-span-3 text-xs text-muted-foreground">
          Fecha de referencia: {rate.date} {rate.source === "fallback" ? "(último valor disponible, sin tasa para hoy)" : ""}
        </p>
      ) : null}
    </div>
  );
}
