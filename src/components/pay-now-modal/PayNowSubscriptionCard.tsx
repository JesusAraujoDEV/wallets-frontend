import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RecurringTransaction } from "@/lib/types";
import type { Currency } from "./types";

export function PayNowSubscriptionCard({
  subscription, referenceCurrency, editableReference, setEditableReference,
}: {
  subscription: RecurringTransaction | null;
  referenceCurrency: Currency;
  editableReference: string;
  setEditableReference: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {subscription?.description || t("subscriptions.subscriptionFallback")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("subscriptions.nextPaymentLabel", { date: subscription?.next_date })}
        </p>
      </div>
      <div className="space-y-1">
        <Label htmlFor="paynow-reference-amount" className="text-xs text-muted-foreground">
          {t("subscriptions.referenceBase", { currency: referenceCurrency })}
        </Label>
        <Input
          id="paynow-reference-amount"
          type="number"
          step="0.01"
          min="0"
          value={editableReference}
          onChange={(e) => setEditableReference(e.target.value)}
        />
      </div>
    </div>
  );
}
