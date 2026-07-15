import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExchangeRate } from "@/lib/rates";

function fmt(value: number | null | undefined) {
  if (value == null || !isFinite(value)) return "—";
  return value.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function RateCurrentCards({ rate, loading }: { rate: ExchangeRate | undefined; loading: boolean }) {
  const cards = [
    { label: "USD (Dólar BCV)", value: rate?.usdRate, accent: "text-emerald-600" },
    { label: "EUR (Euro BCV)", value: rate?.eurRate, accent: "text-blue-600" },
    { label: "USDT (Binance)", value: rate?.usdtRate, accent: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="shadow-md border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${c.accent}`}>{loading ? "…" : fmt(c.value)}</div>
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
