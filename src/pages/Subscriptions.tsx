import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, Loader2, Plus, Repeat, Zap } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { CategorySelector } from "@/components/CategorySelector";
import { ConfirmPaymentModal, formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import { CategoriesStore, AccountsStore } from "@/lib/storage";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  fetchPendingTransactions,
  fetchRecurringTransactions,
  PENDING_TRANSACTIONS_QUERY_KEY,
  RECURRING_TRANSACTIONS_QUERY_KEY,
  triggerRecurringTransactions,
  updateRecurringTransaction,
} from "@/lib/subscriptions";
import type { Account, Category, RecurringExecutionMode, RecurringTransactionPayload, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

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
};

function modeLabel(mode: RecurringExecutionMode) {
  return mode === "auto" ? "Automático" : "Recordatorio";
}

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPendingTx, setSelectedPendingTx] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSubscriptionForm>({
    defaultValues: {
      description: "",
      amount: undefined as unknown as number,
      frequency: "monthly",
      next_date: new Date().toISOString().slice(0, 10),
      execution_mode: "manual",
      is_active: true,
      categoryId: "",
      accountId: "",
      currency: "USD",
    },
  });

  const selectedMode = watch("execution_mode");
  const selectedIsActive = watch("is_active");
  const selectedFrequency = watch("frequency");

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
  }, [toast]);

  const pendingQuery = useQuery({
    queryKey: PENDING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchPendingTransactions,
  });

  const recurringQuery = useQuery({
    queryKey: RECURRING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchRecurringTransactions,
  });

  const createMutation = useMutation({
    mutationFn: (payload: RecurringTransactionPayload) => createRecurringTransaction(payload),
    onSuccess: async () => {
      toast({
        title: "Suscripción creada",
        description: "La suscripción recurrente fue creada correctamente.",
      });
      setCreateDialogOpen(false);
      reset({
        description: "",
        amount: undefined as unknown as number,
        frequency: "monthly",
        next_date: new Date().toISOString().slice(0, 10),
        execution_mode: "manual",
        is_active: true,
        categoryId: "",
        accountId: "",
        currency: "USD",
      });
      await queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la suscripción",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateRecurringTransaction(id, { is_active: isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo actualizar la suscripción",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecurringTransaction(id),
    onSuccess: async () => {
      toast({
        title: "Suscripción eliminada",
        description: "La suscripción se eliminó correctamente.",
      });
      await queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo eliminar la suscripción",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const triggerMutation = useMutation({
    mutationFn: triggerRecurringTransactions,
    onSuccess: (result) => {
      toast({
        title: "Cronjob ejecutado",
        description: result.message || "El worker de suscripciones se ejecutó manualmente.",
      });
      void queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo forzar el cronjob",
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
      execution_mode: values.execution_mode,
      is_active: values.is_active,
      categoryId: Number(values.categoryId),
      accountId: values.accountId ? Number(values.accountId) : undefined,
      currency: values.currency,
    });
  });

  const pendingTransactions = pendingQuery.data ?? [];
  const recurringTransactions = recurringQuery.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Repeat className="h-6 w-6" />
                Suscripciones
              </CardTitle>
              <CardDescription>
                Controla cobros recurrentes y confirma manualmente los pagos pendientes para evitar fugas de caja.
              </CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={() => triggerMutation.mutate()}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Forzar Cronjob
              </Button>
              <Button type="button" className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Suscripción
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pending transactions section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Alertas de pago</CardTitle>
          <CardDescription>
            Los movimientos en manual quedan pending hasta que confirmes la fecha real de pago.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando pendientes...
            </div>
          ) : pendingTransactions.length > 0 ? (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tienes {pendingTransactions.length} pago(s) pendiente(s)</AlertTitle>
                <AlertDescription>
                  Confirma cada transacción para moverla de pending a completed y mantener tus métricas confiables.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {pendingTransactions.map((tx) => (
                  <Card key={tx.id} className="border-destructive/30">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{tx.description || "Pago recurrente"}</p>
                          <p className="text-xs text-muted-foreground">Fecha programada: {tx.date}</p>
                        </div>
                        <Badge variant="destructive">Pendiente</Badge>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {formatAmountWithCurrency(tx.amount, (tx.currency as "USD" | "EUR" | "VES") || "USD")}
                        </p>
                        <Button
                          type="button"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setSelectedPendingTx(tx);
                            setConfirmDialogOpen(true);
                          }}
                        >
                          Confirmar Pago
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Alert>
              <CalendarClock className="h-4 w-4" />
              <AlertTitle>Sin pagos pendientes</AlertTitle>
              <AlertDescription>
                Los cobros auto-pago ya se marcan completed automáticamente y aquí solo verás los que requieren confirmación manual.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recurring transactions management section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Gestión de suscripciones</CardTitle>
          <CardDescription>
            Activa, pausa o elimina reglas recurrentes. Las manuales crean pending; las auto-pago se completan sin intervención.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recurringQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando suscripciones...
            </div>
          ) : recurringTransactions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No hay suscripciones configuradas</AlertTitle>
              <AlertDescription>
                Crea una suscripción para empezar a automatizar cobros periódicos.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {recurringTransactions.map((item) => (
                <Card key={item.id} className="border-border bg-card">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Próximo cobro: {item.next_date} · Frecuencia: {item.frequency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.execution_mode === "manual" ? "destructive" : "secondary"}>
                          {modeLabel(item.execution_mode)}
                        </Badge>
                        <Badge variant={item.is_active ? "default" : "outline"}>
                          {item.is_active ? "Activa" : "Pausada"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-foreground">
                        {formatAmountWithCurrency(item.amount, item.currency)}
                      </p>
                      <div className="flex items-center gap-3">
                        <Label htmlFor={`active-${item.id}`} className="text-sm text-muted-foreground">
                          {item.is_active ? "Pausar" : "Reanudar"}
                        </Label>
                        <Switch
                          id={`active-${item.id}`}
                          checked={item.is_active}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: item.id, isActive: checked })}
                          disabled={toggleActiveMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create subscription dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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

            {/* Amount + Currency grid */}
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
                <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as "USD" | "EUR" | "VES")}>
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

            {/* Category selector */}
            <div className="space-y-2">
              <Label>Categoría</Label>
              <CategorySelector
                value={watch("categoryId")}
                onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
                filterType="expense"
                categories={categories}
              />
            </div>

            {/* Account selector (optional) */}
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

            {/* Frequency + Start date */}
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
                <Label htmlFor="next_date">Fecha de inicio</Label>
                <Input id="next_date" type="date" {...register("next_date", { required: true })} />
              </div>
            </div>

            {/* Execution mode radio cards */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">¿Cómo pagas esto?</Label>
              <RadioGroup
                value={selectedMode}
                onValueChange={(v) => setValue("execution_mode", v as RecurringExecutionMode)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    selectedMode === "auto" && "border-primary ring-2 ring-primary/30",
                  )}
                >
                  <RadioGroupItem value="auto" className="sr-only" />
                  <p className="font-medium text-foreground">Automático</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platica lo registrará solo cada mes (ideal para débitos automáticos).
                  </p>
                </label>
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    selectedMode === "manual" && "border-primary ring-2 ring-primary/30",
                  )}
                >
                  <RadioGroupItem value="manual" className="sr-only" />
                  <p className="font-medium text-foreground">Recordatorio</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Platica te avisará para que confirmes la fecha, el monto y de qué cuenta lo pagaste.
                  </p>
                </label>
              </RadioGroup>
            </div>

            {/* Active toggle */}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Suscripción activa</p>
                  <p className="text-xs text-muted-foreground">Puedes pausar y reactivar cuando quieras.</p>
                </div>
                <Switch
                  checked={selectedIsActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(false)}>
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

      {/* Confirm payment modal */}
      <ConfirmPaymentModal
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        pendingTx={selectedPendingTx}
        referenceCurrency={selectedPendingTx?.currency as "USD" | "EUR" | "VES" ?? "USD"}
        referenceAmount={selectedPendingTx?.amount ?? 0}
        accounts={accounts}
        onConfirmed={async () => {
          setSelectedPendingTx(null);
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
          ]);
        }}
      />
    </div>
  );
}
