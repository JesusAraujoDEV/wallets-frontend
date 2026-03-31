import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarClock, CreditCard, Loader2, MoreVertical, Pencil, Plus, Repeat, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { CategorySelector } from "@/components/CategorySelector";
import { ConfirmPaymentModal, formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import { PayNowModal } from "@/components/PayNowModal";
import { CategoriesStore, AccountsStore, onDataChange } from "@/lib/storage";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  fetchPendingTransactions,
  fetchRecurringTransactions,
  payNowRecurringTransaction,
  PENDING_TRANSACTIONS_QUERY_KEY,
  RECURRING_TRANSACTIONS_QUERY_KEY,
  updateRecurringTransaction,
} from "@/lib/subscriptions";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";
import type { Account, Category, Debt, PayNowRecurringPayload, RecurringExecutionMode, RecurringTransaction, RecurringTransactionPayload, Transaction, UpdateRecurringTransactionPayload } from "@/lib/types";
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
  debtId: string;
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
  const [payNowDialogOpen, setPayNowDialogOpen] = useState(false);
  const [selectedPayNowSub, setSelectedPayNowSub] = useState<RecurringTransaction | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<RecurringTransaction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<RecurringTransaction | null>(null);

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });
  const activeDebts = (debtsQuery.data ?? []).filter((d: Debt) => d.status !== "paid");

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
      debtId: "",
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

    // Sync local state when CategoriesStore emits changes (e.g. new category created)
    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
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
        debtId: "",
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

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      setTogglingId(id);
      return updateRecurringTransaction(id, { isActive });
    },
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
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecurringTransaction(id),
    onSuccess: async () => {
      toast({
        title: "Suscripción eliminada",
        description: "La suscripción se eliminó correctamente.",
      });
      setDeleteConfirmOpen(false);
      setDeletingSubscription(null);
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

  const editForm = useForm<CreateSubscriptionForm>({
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
      debtId: "",
    },
  });

  const editSelectedMode = editForm.watch("execution_mode");
  const editSelectedIsActive = editForm.watch("is_active");
  const editSelectedFrequency = editForm.watch("frequency");

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRecurringTransactionPayload }) =>
      updateRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({
        title: "Suscripción actualizada",
        description: "Los cambios se guardaron correctamente.",
      });
      setEditDialogOpen(false);
      setEditingSubscription(null);
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

  function openEditDialog(sub: RecurringTransaction) {
    setEditingSubscription(sub);
    editForm.reset({
      description: sub.description,
      amount: sub.amount,
      frequency: sub.frequency,
      next_date: sub.next_date,
      execution_mode: sub.execution_mode,
      is_active: sub.is_active,
      categoryId: sub.categoryId,
      accountId: sub.accountId,
      currency: sub.currency,
      debtId: sub.debtId || "",
    });
    setEditDialogOpen(true);
  }

  const onSubmitEdit = editForm.handleSubmit((values) => {
    if (!editingSubscription) return;

    const dirty = editForm.formState.dirtyFields;
    const dirtyKeys = Object.keys(dirty) as (keyof CreateSubscriptionForm)[];

    // Nothing changed — just close
    if (dirtyKeys.length === 0) {
      setEditDialogOpen(false);
      setEditingSubscription(null);
      return;
    }

    if (dirty.categoryId && !values.categoryId) {
      toast({
        title: "Campos incompletos",
        description: "Selecciona una categoría.",
        variant: "destructive",
      });
      return;
    }

    // Build partial camelCase payload from dirty fields only
    const payload: UpdateRecurringTransactionPayload = {};

    if (dirty.description) payload.description = values.description.trim();
    if (dirty.amount) payload.amount = Number(values.amount);
    if (dirty.frequency) payload.frequency = values.frequency;
    if (dirty.next_date) payload.nextDate = values.next_date;
    if (dirty.execution_mode) payload.executionMode = values.execution_mode;
    if (dirty.is_active) payload.isActive = values.is_active;
    if (dirty.categoryId) payload.categoryId = Number(values.categoryId);
    if (dirty.accountId) payload.accountId = values.accountId ? Number(values.accountId) : null;
    if (dirty.currency) payload.currency = values.currency;
    if (dirty.debtId) payload.debtId = values.debtId ? Number(values.debtId) : null;

    updateMutation.mutate({
      id: editingSubscription.id,
      payload,
    });
  });

  function openDeleteConfirm(sub: RecurringTransaction) {
    setDeletingSubscription(sub);
    setDeleteConfirmOpen(true);
  }

  const payNowMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PayNowRecurringPayload }) =>
      payNowRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({
        title: "Pago adelantado",
        description: "La transacción se registró correctamente.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo adelantar el pago",
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
      type: "gasto",
      execution_mode: values.execution_mode,
      is_active: values.is_active,
      categoryId: Number(values.categoryId),
      accountId: values.accountId ? Number(values.accountId) : undefined,
      currency: values.currency,
      debtId: values.debtId ? Number(values.debtId) : null,
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

            <Button type="button" className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Suscripción
            </Button>
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
                <Card key={item.id} className={cn("border-border bg-card", !item.is_active && "opacity-60")}>
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
                          onCheckedChange={(checked) => {
                            toggleActiveMutation.mutate({ id: item.id, isActive: checked });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={toggleActiveMutation.isPending && togglingId === item.id}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedPayNowSub(item);
                          setPayNowDialogOpen(true);
                        }}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Adelantar Pago
                      </Button>

                      {/* Desktop actions */}
                      <div className="hidden items-center gap-1 md:flex">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(item)}
                          aria-label="Editar suscripción"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => openDeleteConfirm(item)}
                          aria-label="Eliminar suscripción"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Mobile actions */}
                      <div className="flex md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Más opciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteConfirm(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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

            {/* Debt link (optional) */}
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
                    {activeDebts.map((d: Debt) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.contactName} — {d.type === "payable" ? "Por Pagar" : "Por Cobrar"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

      {/* Pay now modal */}
      <PayNowModal
        open={payNowDialogOpen}
        onOpenChange={setPayNowDialogOpen}
        subscription={selectedPayNowSub}
        accounts={accounts}
        onConfirm={async (payload) => {
          if (!selectedPayNowSub) return;
          await payNowMutation.mutateAsync({
            id: selectedPayNowSub.id,
            payload: {
              accountId: payload.accountId,
              date: payload.date,
              amount: payload.amount,
              currency: payload.currency,
            },
          });
          setSelectedPayNowSub(null);
        }}
      />

      {/* Edit subscription dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingSubscription(null); }}>
        <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Editar suscripción</DialogTitle>
            <DialogDescription>
              Modifica los datos de la suscripción. Puedes pausarla sin eliminarla.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitEdit}>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Input
                id="edit-description"
                placeholder="Ej. Netflix, Spotify, Renta"
                {...editForm.register("description", { required: "La descripción es obligatoria." })}
              />
              {editForm.formState.errors.description ? <p className="text-xs text-destructive">{editForm.formState.errors.description.message}</p> : null}
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Monto</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...editForm.register("amount", {
                    valueAsNumber: true,
                    required: "El monto es obligatorio.",
                    min: { value: 0.01, message: "El monto debe ser mayor a cero." },
                  })}
                />
                {editForm.formState.errors.amount ? <p className="text-xs text-destructive">{editForm.formState.errors.amount.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select value={editForm.watch("currency")} onValueChange={(v) => editForm.setValue("currency", v as "USD" | "EUR" | "VES")}>
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
                value={editForm.watch("categoryId")}
                onChange={(id) => editForm.setValue("categoryId", id, { shouldValidate: true })}
                filterType="expense"
                categories={categories}
              />
            </div>

            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select
                value={editForm.watch("accountId") || "__none__"}
                onValueChange={(v) => editForm.setValue("accountId", v === "__none__" ? "" : v, { shouldValidate: true })}
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

            {/* Debt link (optional) — edit dialog */}
            {activeDebts.length > 0 && (
              <div className="space-y-2">
                <Label>Vincular a Deuda (opcional)</Label>
                <Select
                  value={editForm.watch("debtId") || "__none__"}
                  onValueChange={(v) => editForm.setValue("debtId", v === "__none__" ? "" : v, { shouldValidate: true, shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin deuda vinculada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sin deuda vinculada</SelectItem>
                    {activeDebts.map((d: Debt) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.contactName} — {d.type === "payable" ? "Por Pagar" : "Por Cobrar"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select value={editSelectedFrequency} onValueChange={(value) => editForm.setValue("frequency", value, { shouldValidate: true })}>
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
                <Label htmlFor="edit-next_date">Próximo cobro</Label>
                <Input id="edit-next_date" type="date" {...editForm.register("next_date", { required: true })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">¿Cómo pagas esto?</Label>
              <RadioGroup
                value={editSelectedMode}
                onValueChange={(v) => editForm.setValue("execution_mode", v as RecurringExecutionMode)}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <label
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    editSelectedMode === "auto" && "border-primary ring-2 ring-primary/30",
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
                    editSelectedMode === "manual" && "border-primary ring-2 ring-primary/30",
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

            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Suscripción activa</p>
                  <p className="text-xs text-muted-foreground">Puedes pausar y reactivar cuando quieras.</p>
                </div>
                <Switch
                  checked={editSelectedIsActive}
                  onCheckedChange={(checked) => editForm.setValue("is_active", checked)}
                />
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => { setEditDialogOpen(false); setEditingSubscription(null); }}>
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={(open) => { setDeleteConfirmOpen(open); if (!open) setDeletingSubscription(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la suscripción{" "}
              <span className="font-semibold">{deletingSubscription?.description}</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingSubscription) {
                  deleteMutation.mutate(deletingSubscription.id);
                }
              }}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
