import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TransactionRow } from "./TransactionRow";
import type { DailyTotal } from "./useDailyTotals";
import type { Account, Category, Transaction } from "@/lib/types";

export function TransactionGroupList({
  groupedTransactions, vesRateByDate, groupTotals, categories, accounts, deletingId, onEdit, onDeleteRequest,
  isEmpty, pageLoading, hasMore, onLoadMore,
}: {
  groupedTransactions: Record<string, Transaction[]>;
  vesRateByDate: Record<string, number | null>;
  groupTotals: Record<string, DailyTotal>;
  categories: Category[]; accounts: Account[]; deletingId: string | null;
  onEdit: (tx: Transaction) => void; onDeleteRequest: (id: string) => void;
  isEmpty: boolean; pageLoading: boolean; hasMore: boolean; onLoadMore: () => void;
}) {
  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, txs]) => (
        <div key={date} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground flex-1">
              <div className="h-px bg-border flex-1" />
              <span className="px-3">
                {dayjs(String(date).slice(0, 10)).format('dddd, MMM D, YYYY')} • Tasa: {vesRateByDate[date] != null ? Number(vesRateByDate[date]).toFixed(2) : '…'}
              </span>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="sm:ml-3 flex items-center gap-2 text-xs whitespace-nowrap">
              <Badge variant="outline" className="border-green-500 text-green-600">+${(groupTotals[date]?.income ?? 0).toFixed(2)}</Badge>
              <Badge variant="outline" className="border-red-500 text-red-600">-${(groupTotals[date]?.expenses ?? 0).toFixed(2)}</Badge>
              <Badge variant="secondary" className="font-semibold">Bal: ${(groupTotals[date]?.balance ?? 0).toFixed(2)}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            {txs.map((transaction) => (
              <TransactionRow
                key={transaction.id} transaction={transaction} categories={categories} accounts={accounts}
                rateForDate={vesRateByDate[String(date).slice(0, 10)] ?? null}
                deletingId={deletingId} onEdit={onEdit} onDeleteRequest={onDeleteRequest}
              />
            ))}
          </div>
        </div>
      ))}
      {isEmpty && !pageLoading && (
        <div className="text-center py-12 text-muted-foreground">No transactions found. Try adjusting your filters.</div>
      )}
      <div className="flex justify-center pt-2">
        {pageLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : hasMore ? (
          <Button variant="outline" onClick={onLoadMore}>Load more days</Button>
        ) : null}
      </div>
    </div>
  );
}
