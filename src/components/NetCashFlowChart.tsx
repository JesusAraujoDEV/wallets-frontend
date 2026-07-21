import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface NetCashFlowChartProps {
  summary?: { net_cash_flow?: number; income_total?: number; expense_total?: number; savings_rate_avg?: number };
  data: Array<{ period: string; income: number; expense: number; net_flow: number; savings_rate: number }>;
}

export function NetCashFlowChart({ summary, data }: NetCashFlowChartProps) {
  const { t } = useTranslation();
  return (
    <Card className="p-6 shadow-md border-0">
      <div className="flex items-end justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">{t("charts.netCashFlow.title")}</h3>
        {summary ? (
          <div className="text-sm text-muted-foreground">
            {t("charts.netCashFlow.netFlowTotal")} <span className={`font-semibold ${Number(summary.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>${Number(summary.net_cash_flow || 0).toFixed(2)}</span>
          </div>
        ) : null}
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} tickFormatter={(v) => `$${Number(v).toFixed(0)}`} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'savings_rate') return [`${Math.round(value * 100)}%`, t("charts.netCashFlow.savingsRate")];
              if (name === 'net_flow') return [`$${value.toFixed(2)}`, t("charts.netCashFlow.netFlow")];
              if (name === 'income') return [`$${value.toFixed(2)}`, t("charts.netCashFlow.income")];
              if (name === 'expense') return [`$${value.toFixed(2)}`, t("charts.netCashFlow.expense")];
              return value;
            }}
            labelFormatter={(label, payload) => {
              const p = payload && payload[0] ? (payload[0] as any).payload : undefined;
              if (!p) return label as any;
              return t("charts.netCashFlow.period", { period: p.period });
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="net_flow" name={t("charts.netCashFlow.netFlow")} radius={[4,4,0,0]}
            fill="#10b981"
            shape={(props) => {
              const { fill, ...rest } = props as any;
              const color = (props as any).payload.net_flow >= 0 ? '#10b981' : '#ef4444';
              return <Bar {...rest} fill={color} /> as any;
            }}
          />
          <Line yAxisId="right" type="monotone" dataKey="savings_rate" name={t("charts.netCashFlow.savingsRate")} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="left" type="monotone" dataKey="income" name={t("charts.netCashFlow.income")} stroke="#22c55e" strokeWidth={1} dot={false} opacity={0.4} />
          <Line yAxisId="left" type="monotone" dataKey="expense" name={t("charts.netCashFlow.expense")} stroke="#ef4444" strokeWidth={1} dot={false} opacity={0.4} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
