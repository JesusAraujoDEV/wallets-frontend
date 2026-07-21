import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Account } from "@/lib/types";
import type { Currency } from "./types";

export function PayNowAmountCurrencyFields({
  finalAmount, setFinalAmount, loadingRate, finalCurrency, referenceCurrency, selectedAccount,
}: {
  finalAmount: string;
  setFinalAmount: (v: string) => void;
  loadingRate: boolean;
  finalCurrency: Currency;
  referenceCurrency: Currency;
  selectedAccount: Account | undefined;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="paynow-final-amount">{t("transactions.finalAmount")}</Label>
        <div className="relative">
          <Input
            id="paynow-final-amount"
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
        {selectedAccount && finalCurrency !== referenceCurrency && (
          <p className="text-xs text-muted-foreground">
            {t("transactions.convertedViaBcv", { currency: finalCurrency })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t("transactions.finalCurrency")}</Label>
        <Input value={finalCurrency} disabled className="bg-muted" />
      </div>
    </div>
  );
}
