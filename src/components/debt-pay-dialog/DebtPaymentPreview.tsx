import type { Account, Debt } from "@/lib/types";

export function DebtPaymentPreview({
  debt, selectedAccount, hasValidAmount, requiresConversion, hasValidEquivalentAmount, canRenderPreview,
  numericAmount, finalUsedAmount, finalUsedRate,
}: {
  debt: Debt;
  selectedAccount: Account | undefined;
  hasValidAmount: boolean;
  requiresConversion: boolean;
  hasValidEquivalentAmount: boolean;
  canRenderPreview: boolean;
  numericAmount: number;
  finalUsedAmount: number;
  finalUsedRate: number;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      {!selectedAccount && (
        <p className="text-xs text-muted-foreground">
          Selecciona una cuenta para previsualizar el pago final.
        </p>
      )}
      {selectedAccount && !hasValidAmount && (
        <p className="text-xs text-muted-foreground">
          Ingresa un monto válido para ver la previsualización.
        </p>
      )}
      {selectedAccount && hasValidAmount && requiresConversion && !hasValidEquivalentAmount && (
        <p className="text-xs text-muted-foreground">
          Ingresa un monto a debitar válido para calcular la previsualización.
        </p>
      )}
      {canRenderPreview && selectedAccount && (
        <p className="text-sm text-foreground">
          Abonarás {numericAmount.toFixed(2)} {debt.currency} usando {finalUsedAmount.toFixed(2)}{" "}
          {selectedAccount.currency} (Tasa aplicada: {finalUsedRate.toFixed(6)})
        </p>
      )}
    </div>
  );
}
