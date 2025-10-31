import { Card } from "@/components/ui/card";

export interface MonthlyForecastGaugeProps {
  budget_total: number;
  current_spending_mtd: number;
  projected_total_spending: number;
  projected_over_under: number; // > 0 means over budget
}

export function MonthlyForecastGauge({ budget_total, current_spending_mtd, projected_total_spending, projected_over_under }: MonthlyForecastGaugeProps) {
  const width = 360; const height = 220; const cx = width/2; const cy = height - 10; const r = Math.min(width, height) * 0.45;
  const startAngle = Math.PI; const endAngle = 0; // semi circle
  const pct = Math.max(0, Math.min(1, (budget_total > 0 ? current_spending_mtd / budget_total : 0)));
  const projPct = Math.max(0, Math.min(1, (budget_total > 0 ? projected_total_spending / budget_total : 0)));

  const arc = (p: number, color: string, strokeWidth = 12) => {
    const ang = startAngle + (endAngle - startAngle) * p;
    const x = cx + r * Math.cos(ang); const y = cy + r * Math.sin(ang);
    const largeArc = p > 0.5 ? 1 : 0;
    const path = `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`;
    return <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />;
  };

  const projColor = projected_over_under > 0 ? '#ef4444' : '#10b981';

  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-4">Monthly Forecast</h3>
      <svg width={width} height={height} className="mx-auto block">
        {/* base */}
        {arc(1, 'hsl(var(--muted))', 12)}
        {/* current */}
        {arc(pct, 'hsl(var(--primary))', 12)}
        {/* projected marker */}
        {arc(projPct, projColor, 3)}
        {/* ticks text */}
        <text x={cx - r} y={cy + 16} textAnchor="start" fontSize={10} fill="hsl(var(--muted-foreground))">0</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{`$${Math.round(budget_total/2).toString()}`}</text>
        <text x={cx + r} y={cy + 16} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">${budget_total.toFixed(0)}</text>
      </svg>
      <div className="text-center mt-2">
        <div className="text-sm text-muted-foreground">Proyección</div>
        <div className="text-2xl font-bold">${projected_total_spending.toFixed(2)}</div>
        <div className={`text-sm ${projected_over_under > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {projected_over_under >= 0 ? '+' : ''}${projected_over_under.toFixed(2)} vs presupuesto
        </div>
      </div>
    </Card>
  );
}
