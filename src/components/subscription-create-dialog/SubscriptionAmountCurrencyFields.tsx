import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateSubscriptionForm } from "./types";

export function SubscriptionAmountCurrencyFields({
  register,
  errors,
  currency,
  onCurrencyChange,
}: {
  register: UseFormRegister<CreateSubscriptionForm>;
  errors: FieldErrors<CreateSubscriptionForm>;
  currency: "USD" | "EUR" | "VES";
  onCurrencyChange: (currency: "USD" | "EUR" | "VES") => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          {...register("amount", {
            valueAsNumber: true,
            required: "El monto es obligatorio.",
            min: { value: 0.01, message: "El monto debe ser mayor a cero." },
          })}
        />
        {errors.amount ? <p className="text-xs text-destructive">{errors.amount.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label>Moneda</Label>
        <Select value={currency} onValueChange={(v) => onCurrencyChange(v as "USD" | "EUR" | "VES")}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="VES">VES</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
