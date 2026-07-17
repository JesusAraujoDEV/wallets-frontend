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
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          {subscription?.description || "Suscripción"}
        </p>
        <p className="text-xs text-muted-foreground">
          Próximo cobro: {subscription?.next_date}
        </p>
      </div>
      <div className="space-y-1">
        <Label htmlFor="paynow-reference-amount" className="text-xs text-muted-foreground">
          Base de referencia ({referenceCurrency})
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
