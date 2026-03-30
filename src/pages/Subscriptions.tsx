import { useEffect, useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { CategoriesStore, AccountsStore } from "@/lib/storage";
import {
  confirmPendingTransaction,
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
};

function formatMoney(value: number) {
  return `$${Math.abs(value || 0).toFixed(2)}`;
}

function modeLabel(mode: RecurringExecutionMode) {
  return mode === "auto" ? "Auto-pago" : "Manual (requiere confirmación)";
}

export default function Subscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPendingTx, setSelectedPendingTx] = useState<Transaction | null>(null);
  const [confirmDate, setConfirmDate] = useState(new Date().toISOString().slice(0, 10));

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
    },
  });

  const selectedMode = watch("execution_mode");
  const selectedIsActive = watch("is_active");
  const selectedFrequency = watch("frequency");

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

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

  const confirmMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => confirmPendingTransaction(id, { date }),
    onSuccess: async () => {
      toast({
        title: "Pago confirmado",
        description: "La transacción cambió a estado completed.",
      });
      setConfirmDialogOpen(false);
      setSelectedPendingTx(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo confirmar el pago",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const openConfirmDialog = (tx: Transaction) => {
    setSelectedPendingTx(tx);
    setConfirmDate(new Date().toISOString().slice(0, 10));
    setConfirmDialogOpen(true);
  };

  const onSubmitCreate = handleSubmit((values) => {
    if (!values.categoryId || !values.accountId) {
      toast({
        title: "Campos incompletos",
        description: "Selecciona cuenta y categoría para crear la suscripción.",
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
      accountId: Number(values.accountId),
    });
  });

  const pendingTransactions = pendingQuery.data ?? [];
  const recurringTransactions = recurringQuery.data ?? [];

  return (
    <div className="space-y-6">
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
                        <p className="text-sm font-semibold text-foreground">{formatMoney(tx.amount)}</p>
                        <Button type="button" className="w-full sm:w-auto" onClick={() => openConfirmDialog(tx)}>
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
                      <p className="text-lg font-semibold text-foreground">{formatMoney(item.amount)}</p>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cuenta</Label>
                <Select value={watch("accountId")} onValueChange={(value) => setValue("accountId", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={watch("categoryId")} onValueChange={(value) => setValue("categoryId", value, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            <div className="rounded-lg border border-border p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Modo de ejecución</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMode === "auto"
                      ? "Auto-pago: el backend crea transacciones completed automáticamente."
                      : "Manual: crea pending para confirmar luego la fecha real de pago."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="execution-toggle" className="text-sm text-muted-foreground">
                    {selectedMode === "auto" ? "Auto" : "Manual"}
                  </Label>
                  <Switch
                    id="execution-toggle"
                    checked={selectedMode === "auto"}
                    onCheckedChange={(checked) => setValue("execution_mode", checked ? "auto" : "manual")}
                  />
                </div>
              </div>
            </div>

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

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Confirmar pago</DialogTitle>
            <DialogDescription>
              Marca el movimiento manual como completed usando la fecha real en que se pagó.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium text-foreground">{selectedPendingTx?.description || "Transacción"}</p>
              <p className="text-xs text-muted-foreground">Monto: {formatMoney(selectedPendingTx?.amount || 0)}</p>
              <p className="text-xs text-muted-foreground">Estado actual: pending</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-date">Fecha real de pago</Label>
              <Input id="confirm-date" type="date" value={confirmDate} onChange={(event) => setConfirmDate(event.target.value)} />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!selectedPendingTx || confirmMutation.isPending}
              onClick={() => {
                if (!selectedPendingTx) return;
                confirmMutation.mutate({ id: selectedPendingTx.id, date: confirmDate });
              }}
            >
              {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
