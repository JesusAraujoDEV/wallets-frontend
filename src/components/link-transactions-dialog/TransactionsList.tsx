import { Loader2 } from "lucide-react";
import type { Debt, Transaction } from "@/lib/types";
import { TransactionRow } from "./TransactionRow";

interface TransactionsListProps {
  loading: boolean;
  transactions: Transaction[];
  debt: Debt | null;
  initialLinked: Set<string>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function TransactionsList({
  loading,
  transactions,
  debt,
  initialLinked,
  selected,
  onToggle,
}: TransactionsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando transacciones...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay transacciones disponibles en esta categoría.
      </p>
    );
  }

  return (
    <>
      {transactions.map((tx) => (
        <TransactionRow
          key={tx.id}
          tx={tx}
          debt={debt}
          isLinked={initialLinked.has(tx.id)}
          isChecked={selected.has(tx.id)}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}
