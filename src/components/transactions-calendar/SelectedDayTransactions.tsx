import dayjs from "dayjs";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDisplayCurrency, currencySymbol } from "@/lib/displayCurrency";
import type { Transaction } from "@/lib/types";

interface SelectedDayTransactionsProps {
  selectedDate: string;
  total: number;
  transactions: Transaction[];
}

export function SelectedDayTransactions({ selectedDate, total, transactions }: SelectedDayTransactionsProps) {
  const [displayCurrency] = useDisplayCurrency();
  const sym = currencySymbol(displayCurrency);
  const income = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amountUsd ?? tx.amount ?? 0), 0);
  const expense = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amountUsd ?? tx.amount ?? 0), 0);

  return (
    <div className="mt-6 border-t pt-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h4 className="text-base sm:text-lg font-bold">
          {dayjs(selectedDate).format('dddd, D [de] MMMM')}
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="outline" className="border-emerald-500 text-emerald-600">+{sym}{income.toFixed(2)}</Badge>
          <Badge variant="outline" className="border-red-500 text-red-600">-{sym}{expense.toFixed(2)}</Badge>
          <Badge variant="secondary" className="font-semibold">{sym}{total.toFixed(2)}</Badge>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No hay transacciones para este dia.
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
              <div className="shrink-0">
                {tx.type === 'income'
                  ? <ArrowUpCircle className="h-6 w-6 text-emerald-500" />
                  : <ArrowDownCircle className="h-6 w-6 text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description || 'Sin descripcion'}</p>
                <p className="text-xs text-muted-foreground">{tx.currency || 'USD'}</p>
              </div>
              <div className={`text-sm font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {tx.type === 'expense' ? '-' : '+'}{sym}{Number(tx.amountUsd ?? tx.amount ?? 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
