import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Currency } from "./types";

interface AmountCurrencyFieldsProps {
  finalAmount: string;
  setFinalAmount: (value: string) => void;
  loadingRate: boolean;
  finalCurrency: Currency;
  referenceCurrency: Currency;
  hasSelectedAccount: boolean;
}

export function AmountCurrencyFields({
  finalAmount, setFinalAmount, loadingRate, finalCurrency, referenceCurrency, hasSelectedAccount,
}: AmountCurrencyFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="confirm-final-amount">Monto final</Label>
        <div className="relative">
          <Input
            id="confirm-final-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={finalAmount}
            onChange={(e) => setFinalAmount(e.target.value)}
            disabled={loadingRate}
          />
          {loadingRate && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {hasSelectedAccount && finalCurrency !== referenceCurrency && (
          <p className="text-xs text-muted-foreground">
            Convertido a {finalCurrency} vía tasa BCV
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Moneda final</Label>
        <Input value={finalCurrency} disabled className="bg-muted" />
      </div>
    </div>
  );
}
