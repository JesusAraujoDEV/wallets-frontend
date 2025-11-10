import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface SpendingHeatmapProps {
  categories: string[];
  weekdays: string[];
  data_points: Array<{ category_idx: number; day_idx: number; amount: number }>;
}

export function SpendingHeatmap({ categories, weekdays, data_points }: SpendingHeatmapProps) {
  const max = data_points.reduce((m, p) => Math.max(m, p.amount), 0);
  const matrix: number[][] = Array.from({ length: categories.length }, () => Array(weekdays.length).fill(0));
  for (const p of data_points) {
    if (matrix[p.category_idx] && typeof matrix[p.category_idx][p.day_idx] === 'number') {
      matrix[p.category_idx][p.day_idx] = p.amount;
    }
  }
  const colorFor = (v: number) => {
    // Pure white for zero values or when the entire matrix is zero
    if (v <= 0 || max <= 0) return '#ffffff';
    const t = Math.max(0, Math.min(1, v / max));
    // Interpolate from light slate to primary
    const light = 230; // hue-ish base
    const hue = 200;
    const sat = 70;
    const l = 96 - t * 50;
    return `hsl(${hue} ${sat}% ${l}%)`;
  };
  return (
    <Card className="p-6 shadow-md border-0">
      <h3 className="text-xl font-semibold text-foreground mb-4">Spending Heatmap</h3>
      <div className="overflow-auto">
        <div className="inline-grid" style={{ gridTemplateColumns: `120px repeat(${weekdays.length}, minmax(40px, 1fr))` }}>
          {/* Header row */}
          <div className="text-xs text-muted-foreground" />
          {weekdays.map((d, i) => (
            <div key={i} className="text-xs text-muted-foreground text-center px-2 pb-2">{d}</div>
          ))}
          {/* Rows */}
          {categories.map((cat, r) => (
            <>
              <div key={`l-${r}`} className="text-sm text-foreground pr-3 py-2 whitespace-nowrap">{cat}</div>
              {weekdays.map((_, c) => {
                const v = matrix[r][c] || 0;
                return (
                  <TooltipProvider key={`${r}-${c}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-8 w-10 md:w-14 border rounded-sm" style={{ backgroundColor: colorFor(v), borderColor: 'hsl(var(--border))' }} />
                      </TooltipTrigger>
                      <TooltipContent>Total spent: ${v.toFixed(2)}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </Card>
  );
}
