import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExchangeRate } from "@/lib/rates";

const PAGE_SIZE = 20;

export function RateHistoryTable({ data }: { data: ExchangeRate[] }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [data]);
  const rows = [...data].reverse(); // most recent first
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <Card className="shadow-md border-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rates.date")}</TableHead>
            <TableHead className="text-right">USD</TableHead>
            <TableHead className="text-right">EUR</TableHead>
            <TableHead className="text-right">USDT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((r) => (
            <TableRow key={r.date}>
              <TableCell className="font-medium">{r.date}</TableCell>
              <TableCell className="text-right">{r.usdRate.toFixed(2)}</TableCell>
              <TableCell className="text-right">{r.eurRate.toFixed(2)}</TableCell>
              <TableCell className="text-right">{r.usdtRate != null ? r.usdtRate.toFixed(2) : "—"}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">{t("rates.noData")}</TableCell></TableRow>
          ) : null}
        </TableBody>
      </Table>
      {pageCount > 1 ? (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("rates.pageOf", { page: currentPage + 1, total: pageCount })}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
