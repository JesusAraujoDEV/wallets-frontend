import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Account } from "@/lib/types";

export function DebtEquivalentAmountField({
  selectedAccount, equivalentAmount, setEquivalentAmount, setManualEquivalentOverride, autoRateLoading,
  officialRate, hasValidAmount, hasValidEquivalentAmount, hasValidImplicitRate, implicitExchangeRate,
  autoRateSourceDate, autoRateError,
}: {
  selectedAccount: Account;
  equivalentAmount: string;
  setEquivalentAmount: (v: string) => void;
  setManualEquivalentOverride: (v: boolean) => void;
  autoRateLoading: boolean;
  officialRate: number | null;
  hasValidAmount: boolean;
  hasValidEquivalentAmount: boolean;
  hasValidImplicitRate: boolean;
  implicitExchangeRate: number;
  autoRateSourceDate: string | null;
  autoRateError: string | null;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="debt-pay-equivalent-amount">
        Monto a debitar en {selectedAccount.currency}
      </Label>
      <div className="relative">
        <Input
          id="debt-pay-equivalent-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={equivalentAmount}
          onChange={(e) => {
            setEquivalentAmount(e.target.value);
            setManualEquivalentOverride(true);
          }}
        />
        {autoRateLoading && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Se autocompleta según BCV para la fecha elegida y puedes ajustarlo si pagaste un monto distinto.
      </p>
      {officialRate && (
        <p className="text-xs text-muted-foreground">Tasa BCV oficial sugerida: {officialRate.toFixed(6)}</p>
      )}
      {hasValidAmount && hasValidEquivalentAmount && hasValidImplicitRate && (
        <p className="text-xs text-muted-foreground">Tasa aplicada: {implicitExchangeRate.toFixed(6)}</p>
      )}
      {autoRateSourceDate && (
        <p className="text-xs text-muted-foreground">Fuente BCV: {autoRateSourceDate}</p>
      )}
      {autoRateError && <p className="text-xs text-destructive">{autoRateError}</p>}
    </div>
  );
}
