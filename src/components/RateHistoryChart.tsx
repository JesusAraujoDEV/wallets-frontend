import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ExchangeRate } from "@/lib/rates";

export function RateHistoryChart({ data, loading }: { data: ExchangeRate[]; loading: boolean }) {
  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-4">Histórico de tasas BCV</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={loading ? [] : data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "11px" }} minTickGap={30} />
          <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} tickFormatter={(v) => `${Number(v).toFixed(0)}`} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
            formatter={(value: number, name: string) => [`Bs. ${Number(value).toFixed(2)}`, name === "usdRate" ? "USD" : name === "eurRate" ? "EUR" : "USDT"]}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Legend formatter={(name) => (name === "usdRate" ? "USD" : name === "eurRate" ? "EUR" : "USDT")} />
          <Line type="monotone" dataKey="usdRate" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="eurRate" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="usdtRate" stroke="#f59e0b" strokeWidth={1.5} dot={false} opacity={0.7} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
