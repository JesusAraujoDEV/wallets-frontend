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
import type { DebtFormValues } from "./types";

export function DebtAmountCurrencyFields({
  register,
  errors,
  currency,
  setCurrency,
}: {
  register: UseFormRegister<DebtFormValues>;
  errors: FieldErrors<DebtFormValues>;
  currency: DebtFormValues["currency"];
  setCurrency: (currency: DebtFormValues["currency"]) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="space-y-2">
        <Label htmlFor="debt-amount">Monto total</Label>
        <Input
          id="debt-amount"
          type="number"
          step="0.01"
          min="0"
          {...register("totalAmount", {
            valueAsNumber: true,
            required: "El monto es obligatorio.",
            min: { value: 0.01, message: "El monto debe ser mayor a cero." },
          })}
        />
        {errors.totalAmount && (
          <p className="text-xs text-destructive">{errors.totalAmount.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Moneda</Label>
        <Select value={currency} onValueChange={(v) => setCurrency(v as DebtFormValues["currency"])}>
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
