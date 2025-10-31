import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface ComparativeMoMProps {
  summary: {
    current_total: number;
    total_delta_percent: number;
    total_delta_usd: number;
    current_period_name?: string;
    previous_period_name?: string;
  };
  categories: Array<{ category: string; current: number; previous: number; delta_percent: number }>;
}

export function ComparativeMoM({ summary, categories }: ComparativeMoMProps) {
  const positive = summary.total_delta_percent > 0; // more spending is red
  return (
    <Card className="p-6 shadow-md border-0">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Comparative MoM</h3>
          <p className="text-xs text-muted-foreground">Comparando {summary.current_period_name || 'Actual'} vs {summary.previous_period_name || 'Anterior'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${summary.current_total.toFixed(2)}</div>
          <div className={`text-sm ${positive ? 'text-red-600' : 'text-green-600'}`}>
            {positive ? '+' : ''}{summary.total_delta_percent.toFixed(1)}% ({summary.total_delta_usd >= 0 ? '+' : ''}${summary.total_delta_usd.toFixed(2)})
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoría</TableHead>
            <TableHead>Gasto Actual</TableHead>
            <TableHead>Gasto Anterior</TableHead>
            <TableHead>Cambio (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((r, i) => {
            const p = r.delta_percent;
            const cls = p > 0 ? 'text-red-600' : p < 0 ? 'text-green-600' : '';
            return (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.category}</TableCell>
                <TableCell>${r.current.toFixed(2)}</TableCell>
                <TableCell>${r.previous.toFixed(2)}</TableCell>
                <TableCell className={cls}>{p > 0 ? '+' : ''}{p.toFixed(1)}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
