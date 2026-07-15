import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ExchangeRate } from "@/lib/rates";

export function RateHistoryTable({ data }: { data: ExchangeRate[] }) {
  const rows = [...data].reverse(); // most recent first

  return (
    <Card className="shadow-md border-0">
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">USD</TableHead>
              <TableHead className="text-right">EUR</TableHead>
              <TableHead className="text-right">USDT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.date}>
                <TableCell className="font-medium">{r.date}</TableCell>
                <TableCell className="text-right">{r.usdRate.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.eurRate.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.usdtRate != null ? r.usdtRate.toFixed(2) : "—"}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Sin datos para el rango seleccionado.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
