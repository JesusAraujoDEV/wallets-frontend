import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategorySelector } from "@/components/CategorySelector";
import type { Account, Category, Debt } from "@/lib/types";
import type { CreateSubscriptionForm } from "./types";

export function SubscriptionBasicFields({ form, idPrefix, accounts, categories, activeDebts }: {
  form: UseFormReturn<CreateSubscriptionForm>;
  idPrefix: string;
  accounts: Account[];
  categories: Category[];
  activeDebts: Debt[];
}) {
  const { register, watch, setValue, formState: { errors, dirtyFields } } = form;
  const selectedSubType = watch("subscriptionType");
  const dirty = idPrefix === "edit" ? dirtyFields : undefined;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Descripción</Label>
        <Input
          id={`${idPrefix}-description`}
          placeholder="Ej. Netflix, Spotify, Renta"
          {...register("description", { required: "La descripción es obligatoria." })}
        />
        {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select
          value={selectedSubType}
          onValueChange={(v) => {
            setValue("subscriptionType", v as "gasto" | "ingreso", { shouldDirty: dirty !== undefined });
            setValue("debtId", "");
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="gasto">Gasto</SelectItem>
            <SelectItem value="ingreso">Ingreso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-amount`}>Monto</Label>
          <Input
            id={`${idPrefix}-amount`}
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
          <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as "USD" | "EUR" | "VES")}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="VES">VES</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoría</Label>
        <CategorySelector
          value={watch("categoryId")}
          onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
          filterType={selectedSubType === "ingreso" ? "income" : "expense"}
          categories={categories}
        />
      </div>

      <div className="space-y-2">
        <Label>Cuenta</Label>
        <Select
          value={watch("accountId") || "__none__"}
          onValueChange={(v) => setValue("accountId", v === "__none__" ? "" : v, { shouldValidate: true })}
        >
          <SelectTrigger><SelectValue placeholder="Sin cuenta asignada (opcional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin cuenta asignada</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeDebts.length > 0 && (
        <div className="space-y-2">
          <Label>Vincular a Deuda (opcional)</Label>
          <Select
            value={watch("debtId") || "__none__"}
            onValueChange={(v) => setValue("debtId", v === "__none__" ? "" : v, { shouldValidate: true, shouldDirty: dirty !== undefined })}
          >
            <SelectTrigger><SelectValue placeholder="Sin deuda vinculada" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sin deuda vinculada</SelectItem>
              {activeDebts
                .filter((d) => selectedSubType === "ingreso" ? d.type === "receivable" : d.type === "payable")
                .map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.contactName} — {d.type === "payable" ? "Por Pagar" : "Por Cobrar"}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
