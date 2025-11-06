import { Card } from "@/components/ui/card";

export interface IncomeVolatilityBoxPlotProps {
  categories: Array<{ category: string; min: number; q1: number; median: number; q3: number; max: number; outliers?: number[]; count?: number }>;
}

export function IncomeVolatilityBoxPlot({ categories }: IncomeVolatilityBoxPlotProps) {
  // Use scrollable width to remain responsive; compute a reasonable width per category
  const basePerCategory = 120;
  const minWidth = 600;
  const width = Math.max(minWidth, Math.max(categories.length, 1) * basePerCategory);
  const height = 320;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const allValues = categories.flatMap(c => [c.min, c.q1, c.median, c.q3, c.max, ...(c.outliers || [])]);
  const vmin = Math.min(...allValues, 0);
  const vmax = Math.max(...allValues, 1);
  const scaleY = (v: number) => {
    const y0 = padding.top; const y1 = height - padding.bottom;
    return y1 - (v - vmin) / (vmax - vmin || 1) * (y1 - y0);
  };
  const bandWidth = (width - padding.left - padding.right) / Math.max(1, categories.length);

  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-4">Income Volatility (Box Plot)</h3>
      <div className="w-full overflow-auto">
        <svg width={width} height={height}>
          {/* Y axis */}
          <g>
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="hsl(var(--border))" />
            {[0,0.25,0.5,0.75,1].map((t,i) => {
              const val = vmin + t*(vmax - vmin);
              const y = scaleY(val);
              return (
                <g key={i}>
                  <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <text x={padding.left - 6} y={y} textAnchor="end" dominantBaseline="central" fill="hsl(var(--muted-foreground))" fontSize={12}>${val.toFixed(0)}</text>
                </g>
              );
            })}
          </g>
          {/* Boxes */}
          {categories.map((c, i) => {
            const x = padding.left + i*bandWidth + bandWidth*0.15;
            const w = bandWidth*0.7;
            const yQ1 = scaleY(c.q1), yQ3 = scaleY(c.q3), yMed = scaleY(c.median), yMin = scaleY(c.min), yMax = scaleY(c.max);
            return (
              <g key={i}>
                {/* whiskers */}
                <line x1={x + w/2} x2={x + w/2} y1={yMin} y2={yQ1} stroke="#16a34a" />
                <line x1={x + w/2} x2={x + w/2} y1={yQ3} y2={yMax} stroke="#16a34a" />
                <line x1={x + w*0.25} x2={x + w*0.75} y1={yMin} y2={yMin} stroke="#16a34a" />
                <line x1={x + w*0.25} x2={x + w*0.75} y1={yMax} y2={yMax} stroke="#16a34a" />
                {/* box */}
                <rect x={x} y={Math.min(yQ1,yQ3)} width={w} height={Math.abs(yQ3 - yQ1)} fill="hsl(var(--primary)/0.15)" stroke="#16a34a" />
                {/* median */}
                <line x1={x} x2={x + w} y1={yMed} y2={yMed} stroke="#16a34a" strokeWidth={2} />
                {/* outliers */}
                {(c.outliers || []).map((o, j) => (
                  <circle key={j} cx={x + w/2} cy={scaleY(o)} r={3} fill="#22c55e">
                    <title>{`${c.category} outlier: $${o.toFixed(2)}`}</title>
                  </circle>
                ))}
                {/* x label */}
                <text x={x + w/2} y={height - padding.bottom + 16} textAnchor="middle" fontSize={12} fill="hsl(var(--muted-foreground))">{c.category}</text>
                {/* tooltip via title on box */}
                <title>{`Categoría: ${c.category}\nMediana: $${c.median.toFixed(2)}\nIQR: $${c.q1.toFixed(2)} - $${c.q3.toFixed(2)}\nRango: $${c.min.toFixed(2)} - $${c.max.toFixed(2)}\nNº de Transacciones: ${c.count ?? '-'} `}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
}
