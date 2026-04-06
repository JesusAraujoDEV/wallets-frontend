import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelector } from "@/components/CategorySelector";
import { UniversalDatePicker } from "@/components/UniversalDatePicker";
import type { Category, Debt, DebtType } from "@/lib/types";

export type DebtFormValues = {
  contactName: string;
  description: string;
  totalAmount: number;
  currency: "USD" | "EUR" | "VES";
  type: DebtType;
  dueDate: string;
  categoryId: string;
};

interface DebtFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  initialDate?: string;
  initialType?: DebtType;
  lockType?: boolean;
  categories: Category[];
  submitting: boolean;
  onSubmit: (values: DebtFormValues) => void;
}

export function DebtFormDialog({
  open,
  onOpenChange,
  debt,
  initialDate,
  initialType,
  lockType = false,
  categories,
  submitting,
  onSubmit,
}: DebtFormDialogProps) {
  const isEdit = !!debt;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DebtFormValues>({
    defaultValues: {
      contactName: "",
      description: "",
      totalAmount: undefined as unknown as number,
      currency: "USD",
      type: "payable",
      dueDate: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (debt) {
        reset({
          contactName: debt.contactName,
          description: debt.description,
          totalAmount: debt.totalAmount,
          currency: debt.currency,
          type: debt.type,
          dueDate: debt.dueDate || "",
          categoryId: debt.categoryId || "",
        });
      } else {
        reset({
          contactName: "",
          description: "",
          totalAmount: undefined as unknown as number,
          currency: "USD",
          type: initialType ?? "payable",
          dueDate: initialDate ?? "",
          categoryId: "",
        });
      }
    }
  }, [open, debt, initialDate, initialType, reset]);

  const onFormSubmit = handleSubmit((values) => {
    onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar deuda" : "Nueva deuda"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la deuda."
              : "Registra una nueva deuda por pagar o por cobrar."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onFormSubmit}>
          {/* Contact name */}
          <div className="space-y-2">
            <Label htmlFor="debt-contact">Contacto</Label>
            <Input
              id="debt-contact"
              placeholder="Nombre del contacto"
              {...register("contactName", { required: "El contacto es obligatorio." })}
            />
            {errors.contactName && (
              <p className="text-xs text-destructive">{errors.contactName.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="debt-description">Descripción</Label>
            <Input
              id="debt-description"
              placeholder="Ej. Préstamo personal, Factura pendiente"
              {...register("description")}
            />
          </div>

          {/* Amount + Currency */}
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
              <Select
                value={watch("currency")}
                onValueChange={(v) => setValue("currency", v as "USD" | "EUR" | "VES")}
              >
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

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={watch("type")}
              disabled={lockType}
              onValueChange={(v) => setValue("type", v as DebtType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payable">Por Pagar</SelectItem>
                <SelectItem value="receivable">Por Cobrar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category selector */}
          <div className="space-y-2">
            <Label>Categoría (opcional)</Label>
            <CategorySelector
              value={watch("categoryId")}
              onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
              categories={categories}
            />
          </div>

          {/* Due date — optional */}
          <div className="space-y-2">
            <Label htmlFor="debt-due-date">Fecha Programada / Limite (opcional)</Label>
            <UniversalDatePicker
              id="debt-due-date"
              value={watch("dueDate") || ""}
              onChange={(date) => setValue("dueDate", date, { shouldValidate: true })}
              placeholder="Seleccionar fecha límite"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear deuda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
