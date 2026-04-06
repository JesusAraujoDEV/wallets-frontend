import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/use-toast";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";
import {
  createRecurringTransaction,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";
import { AccountsStore, CategoriesStore, onDataChange } from "@/lib/storage";
import type {
  Account,
  Category,
  Debt,
  RecurringExecutionMode,
  RecurringTransactionPayload,
} from "@/lib/types";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
] as const;

type CreateSubscriptionForm = {
  description: string;
  amount: number;
  frequency: string;
  next_date: string;
  execution_mode: RecurringExecutionMode;
  is_active: boolean;
  categoryId: string;
  accountId: string;
  currency: "USD" | "EUR" | "VES";
  debtId: string;
  subscriptionType: "gasto" | "ingreso";
};

interface SubscriptionCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: "gasto" | "ingreso";
  lockType?: boolean;
  onCreated?: () => Promise<void> | void;
}

const INITIAL_VALUES: CreateSubscriptionForm = {
  description: "",
  amount: undefined as unknown as number,
  frequency: "monthly",
  next_date: new Date().toISOString().slice(0, 10),
  execution_mode: "manual",
  is_active: true,
  categoryId: "",
  accountId: "",
  currency: "USD",
  debtId: "",
  subscriptionType: "gasto",
};

export function SubscriptionCreateDialog({
  open,
  onOpenChange,
  initialType,
  lockType = false,
  onCreated,
}: SubscriptionCreateDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubscriptionForm>({
    defaultValues: INITIAL_VALUES,
  });

  const selectedMode = watch("execution_mode");
  const selectedFrequency = watch("frequency");
  const selectedSubType = watch("subscriptionType");

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });

  const activeDebts = (debtsQuery.data ?? []).filter((d: Debt) => d.status !== "paid");

  useEffect(() => {
    async function loadReferenceData() {
      await Promise.all([AccountsStore.refresh(), CategoriesStore.refresh()]);
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    }

    loadReferenceData().catch((error) => {
      toast({
        title: "No se pudieron cargar cuentas y categorías",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    });

    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
  }, [toast]);

  useEffect(() => {
    if (open) {
      reset({
        ...INITIAL_VALUES,
        subscriptionType: initialType ?? INITIAL_VALUES.subscriptionType,
        next_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, initialType, reset]);

  const createMutation = useMutation({
    mutationFn: (payload: RecurringTransactionPayload) => createRecurringTransaction(payload),
    onSuccess: async () => {
      toast({
        title: "Suscripción creada",
        description: "La suscripción recurrente fue creada correctamente.",
      });
      onOpenChange(false);
      reset({
        ...INITIAL_VALUES,
        next_date: new Date().toISOString().slice(0, 10),
      });
      await queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
      if (onCreated) await onCreated();
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la suscripción",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmitCreate = handleSubmit((values) => {
    if (!values.categoryId) {
      toast({
        title: "Campos incompletos",
        description: "Selecciona una categoría para crear la suscripción.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      description: values.description.trim(),
      amount: Number(values.amount),
      frequency: values.frequency,
      next_date: values.next_date,
      start_date: values.next_date,
      type: values.subscriptionType,
      execution_mode: values.execution_mode,
      is_active: values.is_active,
      categoryId: Number(values.categoryId),
      accountId: values.accountId ? Number(values.accountId) : undefined,
      currency: values.currency,
      debtId: values.debtId ? Number(values.debtId) : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Crear nueva suscripción</DialogTitle>
          <DialogDescription>
            Define la regla de cobro, elige si será auto-pago o confirmación manual y activa la recurrencia.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmitCreate}>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="Ej. Netflix, Spotify, Renta"
              {...register("description", { required: "La descripción es obligatoria." })}
            />
            {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={selectedSubType}
              disabled={lockType}
              onValueChange={(v) => {
                setValue("subscriptionType", v as "gasto" | "ingreso");
                setValue("debtId", "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasto">Gasto</SelectItem>
                <SelectItem value="ingreso">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as "USD" | "EUR" | "VES") }>
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
              <SelectTrigger>
                <SelectValue placeholder="Sin cuenta asignada (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin cuenta asignada</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeDebts.length > 0 && (
            <div className="space-y-2">
              <Label>Vincular a Deuda (opcional)</Label>
              <Select
                value={watch("debtId") || "__none__"}
                onValueChange={(v) => setValue("debtId", v === "__none__" ? "" : v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin deuda vinculada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin deuda vinculada</SelectItem>
                  {activeDebts
                    .filter((d: Debt) => selectedSubType === "ingreso" ? d.type === "receivable" : d.type === "payable")
                    .map((d: Debt) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.contactName} - {d.type === "payable" ? "Por Pagar" : "Por Cobrar"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select value={selectedFrequency} onValueChange={(value) => setValue("frequency", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <UniversalDatePicker
                value={watch("next_date")}
                onChange={(date) => setValue("next_date", date, { shouldValidate: true })}
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Modo de ejecución</Label>
            <Select
              value={selectedMode}
              onValueChange={(v) => setValue("execution_mode", v as RecurringExecutionMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Suscripción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
