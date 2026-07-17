import type { Transaction } from "@/lib/types";
import { formatAmountWithCurrency, type Currency } from "./types";

interface PaymentSummaryCardProps {
  pendingTx: Transaction | null;
  referenceCurrency: Currency;
  referenceAmount: number;
}

export function PaymentSummaryCard({ pendingTx, referenceCurrency, referenceAmount }: PaymentSummaryCardProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
      <p className="text-sm font-medium text-foreground">{pendingTx?.description || "Pago recurrente"}</p>
      <p className="text-xs text-muted-foreground">Fecha programada: {pendingTx?.date}</p>
      <p className="text-sm font-semibold text-foreground">
        Referencia: {formatAmountWithCurrency(referenceAmount, referenceCurrency)}
      </p>
    </div>
  );
}
