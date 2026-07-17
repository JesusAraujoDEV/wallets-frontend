import dayjs from "dayjs";
import type { Transaction } from "@/lib/types";

interface SelectedDayTransactionsProps {
  selectedDate: string;
  total: number;
  transactions: Transaction[];
}

function amountColorFor(type: Transaction['type']) {
  if (type === 'income') return 'text-green-600';
  if (type === 'expense') return 'text-red-600';
  return '';
}

export function SelectedDayTransactions({ selectedDate, total, transactions }: SelectedDayTransactionsProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-semibold">{dayjs(selectedDate).format('dddd, MMM D, YYYY')}</h4>
        <div className="text-sm text-muted-foreground">Total: ${total.toFixed(2)}</div>
      </div>
      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay transacciones ese día.</div>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-md border bg-card">
              <div className="text-sm font-medium truncate">{tx.description}</div>
              <div className={`text-sm font-semibold ${amountColorFor(tx.type)}`}>
                {tx.type === 'expense' ? '-' : '+'}${Number(tx.amountUsd ?? tx.amount ?? 0).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
