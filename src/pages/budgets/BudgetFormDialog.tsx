import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/lib/types";
import { BudgetPeriodFields } from "./BudgetPeriodFields";
import type { BudgetFormValues } from "./types";

export function BudgetFormDialog({
  open, onOpenChange, isEditing, form, onSubmit, submitLoading, expenseCategories, onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  form: UseFormReturn<BudgetFormValues>;
  onSubmit: (event: React.FormEvent) => void;
  submitLoading: boolean;
  expenseCategories: Category[];
  onCancel: () => void;
}) {
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedCategoryId = watch("categoryId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Presupuesto" : "Crear Presupuesto"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Actualiza categoría, período y monto del presupuesto seleccionado."
              : "Asigna límites por período para controlar tus gastos por categoría."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="budget-category">Categoría</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}
              disabled={submitLoading}
            >
              <SelectTrigger id="budget-category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Presupuesto Global</SelectItem>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("categoryId")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Monto</Label>
            <Input
              id="budget-amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              disabled={submitLoading}
              {...register("amount", {
                valueAsNumber: true,
                required: "El monto es obligatorio.",
                validate: (value) => (Number.isFinite(value) && value > 0) || "El monto debe ser mayor a cero.",
              })}
            />
            {errors.amount ? <p className="text-xs text-red-500">{errors.amount.message}</p> : null}
          </div>

          <BudgetPeriodFields form={form} submitLoading={submitLoading} />

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={submitLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={submitLoading} aria-busy={submitLoading}>
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                isEditing ? "Actualizar presupuesto" : "Guardar presupuesto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
