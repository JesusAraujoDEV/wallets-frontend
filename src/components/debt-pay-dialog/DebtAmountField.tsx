import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Debt } from "@/lib/types";

export function DebtAmountField({
  debt, amount, setAmount, requiresConversion, officialRate, manualEquivalentOverride, setEquivalentAmount,
}: {
  debt: Debt;
  amount: string;
  setAmount: (v: string) => void;
  requiresConversion: boolean;
  officialRate: number | null;
  manualEquivalentOverride: boolean;
  setEquivalentAmount: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="debt-pay-amount">Monto a abonar ({debt.currency})</Label>
      <Input
        id="debt-pay-amount"
        type="number"
        step="0.01"
        min="0"
        max={debt.remaining}
        placeholder="0.00"
        value={amount}
        onChange={(e) => {
          const nextAmount = e.target.value;
          setAmount(nextAmount);
          if (!requiresConversion || !officialRate || manualEquivalentOverride) return;
          const parsedAmount = Number(nextAmount);
          setEquivalentAmount(
            Number.isFinite(parsedAmount) && parsedAmount > 0 ? (parsedAmount * officialRate).toFixed(2) : "",
          );
        }}
      />
    </div>
  );
}
