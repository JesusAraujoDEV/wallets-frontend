import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BudgetPeriod, Category } from "@/lib/types";
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
  const selectedPeriod = watch("period");

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

          <div className="space-y-2">
            <Label htmlFor="budget-period">Período</Label>
            <Select
              value={selectedPeriod}
              onValueChange={(value: BudgetPeriod) => {
                setValue("period", value, { shouldValidate: true });
                if (value !== "one_time") {
                  setValue("specific_month", "", { shouldValidate: true });
                }
              }}
              disabled={submitLoading}
            >
              <SelectTrigger id="budget-period">
                <SelectValue placeholder="Selecciona un período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="one_time">Única Vez</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" {...register("period")} />
          </div>

          {selectedPeriod === "one_time" ? (
            <div className="space-y-2">
              <Label htmlFor="budget-specific-month">Mes específico</Label>
              <input
                id="budget-specific-month"
                type="month"
                disabled={submitLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("specific_month", {
                  validate: (value) => {
                    if (selectedPeriod !== "one_time") {
                      return true;
                    }

                    if (!value) {
                      return "El mes específico es obligatorio para presupuestos de única vez.";
                    }

                    return /^\d{4}-\d{2}$/.test(value) || "El mes específico debe tener formato YYYY-MM.";
                  },
                })}
              />
              {errors.specific_month ? <p className="text-xs text-red-500">{errors.specific_month.message}</p> : null}
            </div>
          ) : null}

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
