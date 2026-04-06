import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  format,
  getDay,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HandCoins,
  Loader2,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchPendingTransactions,
  fetchRecurringTransactions,
  payNowRecurringTransaction,
  PENDING_TRANSACTIONS_QUERY_KEY,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";
import { createDebt, DEBTS_QUERY_KEY, fetchDebts, payDebt } from "@/lib/debts";
import { ConfirmPaymentModal, formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import { DebtFormDialog, type DebtFormValues } from "@/components/DebtFormDialog";
import { DebtPayDialog } from "@/components/DebtPayDialog";
import { PayNowModal } from "@/components/PayNowModal";
import { SubscriptionCreateDialog } from "@/components/SubscriptionCreateDialog";
import { useToast } from "@/components/ui/use-toast";
import { AccountsStore, CategoriesStore, onDataChange } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Account, Category, Debt, DebtType, RecurringTransaction, Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type CalendarEvent = {
  id: string;
  label: string;
  date: string;
  source: "subscription" | "debt" | "pending";
  flow: "income" | "expense";
  amount: number;
  currency: "USD" | "EUR" | "VES";
  status?: "pending" | "partial" | "paid" | "completed";
  debt?: Debt;
  subscription?: RecurringTransaction;
  pendingTx?: Transaction;
};

function buildEvents(
  subscriptions: RecurringTransaction[],
  debts: Debt[],
  pendingTxs: Transaction[],
  categories: Category[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const categoryTypeById = new Map<string, "income" | "expense">();
  for (const category of categories) {
    categoryTypeById.set(category.id, category.type);
  }

  for (const sub of subscriptions) {
    if (!sub.is_active || !sub.next_date) continue;
    const categoryType = categoryTypeById.get(sub.categoryId) ?? "expense";
    events.push({
      id: `sub-${sub.id}`,
      label: sub.description,
      date: sub.next_date,
      source: "subscription",
      flow: categoryType,
      amount: sub.amount,
      currency: sub.currency,
      subscription: sub,
    });
  }

  for (const debt of debts) {
    if (debt.status === "paid" || !debt.dueDate) continue;
    events.push({
      id: `debt-${debt.id}`,
      label: debt.contactName,
      date: debt.dueDate,
      source: "debt",
      flow: debt.type === "payable" ? "expense" : "income",
      amount: debt.remaining,
      currency: debt.currency,
      status: debt.status,
      debt,
    });
  }

  for (const tx of pendingTxs) {
    events.push({
      id: `pending-${tx.id}`,
      label: tx.description || "Pago pendiente",
      date: tx.date,
      source: "pending",
      flow: tx.type,
      amount: tx.amount,
      currency: tx.currency ?? "USD",
      status: tx.status === "completed" ? "completed" : "pending",
      pendingTx: tx,
    });
  }

  return events;
}

export default function CalendarView() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPendingTx, setSelectedPendingTx] = useState<Transaction | null>(null);
  const [payDebtOpen, setPayDebtOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [payNowDialogOpen, setPayNowDialogOpen] = useState(false);
  const [selectedPayNowSub, setSelectedPayNowSub] = useState<RecurringTransaction | null>(null);
  const [createDebtOpen, setCreateDebtOpen] = useState(false);
  const [createDebtType, setCreateDebtType] = useState<DebtType>("payable");
  const [createSubscriptionOpen, setCreateSubscriptionOpen] = useState(false);
  const [createSubscriptionType, setCreateSubscriptionType] = useState<"gasto" | "ingreso">("gasto");

  const subsQuery = useQuery({
    queryKey: RECURRING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchRecurringTransactions,
    staleTime: 30_000,
  });

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
    staleTime: 30_000,
  });

  const pendingQuery = useQuery({
    queryKey: PENDING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchPendingTransactions,
    staleTime: 30_000,
  });

  useEffect(() => {
    async function loadReferenceData() {
      await Promise.all([AccountsStore.refresh(), CategoriesStore.refresh()]);
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    }

    loadReferenceData().catch(() => {
      toast({
        title: "No se pudieron cargar cuentas y categorías",
        description: "Intenta nuevamente.",
        variant: "destructive",
      });
    });

    const off = onDataChange(() => {
      setAccounts(AccountsStore.all());
      setCategories(CategoriesStore.all());
    });
    return off;
  }, [toast]);

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: async () => {
      toast({ title: "Deuda creada", description: "La deuda fue registrada correctamente." });
      setCreateDebtOpen(false);
      await queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
    },
    onError: (error) => {
      toast({
        title: "No se pudo crear la deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const payDebtMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { amount: number; currency: string; accountId: number; date: string; categoryId?: number; exchangeRate?: number } }) =>
      payDebt(id, payload),
    onSuccess: async () => {
      toast({ title: "Pago de deuda registrado", description: "Se actualizó el saldo correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo registrar el pago de deuda",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const payNowMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accountId: number; amount: number; currency: "USD" | "EUR" | "VES"; date: string } }) =>
      payNowRecurringTransaction(id, payload),
    onSuccess: async () => {
      toast({ title: "Cobro/Pago recurrente registrado", description: "Se procesó correctamente." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: PENDING_TRANSACTIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
      ]);
    },
    onError: (error) => {
      toast({
        title: "No se pudo ejecutar la acción rápida",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const events = useMemo(
    () => buildEvents(subsQuery.data ?? [], debtsQuery.data ?? [], pendingQuery.data ?? [], categories),
    [subsQuery.data, debtsQuery.data, pendingQuery.data, categories],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Monday-based offset (0=Mon, 6=Sun)
  const startOffset = useMemo(() => {
    const dow = getDay(days[0]); // 0=Sun
    return dow === 0 ? 6 : dow - 1;
  }, [days]);

  useEffect(() => {
    const hasSelection = days.some((day) => format(day, "yyyy-MM-dd") === selectedDate);
    if (!hasSelection && days.length > 0) {
      const today = days.find((day) => isSameDay(day, new Date()));
      setSelectedDate(format(today ?? days[0], "yyyy-MM-dd"));
    }
  }, [days, selectedDate]);

  const isLoading = subsQuery.isLoading || debtsQuery.isLoading || pendingQuery.isLoading;
  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const selectedTotals = selectedEvents.reduce(
    (acc, event) => {
      if (event.flow === "income") acc.income += event.amount;
      else acc.expense += event.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const pendingTransactions = pendingQuery.data ?? [];

  const handleDebtCreate = (values: DebtFormValues) => {
    createDebtMutation.mutate({
      contactName: values.contactName.trim(),
      description: values.description.trim(),
      totalAmount: values.totalAmount,
      currency: values.currency,
      type: values.type,
      dueDate: values.dueDate || null,
      categoryId: values.categoryId ? Number(values.categoryId) : null,
    });
  };

  const openConfirmFor = (tx: Transaction) => {
    setSelectedPendingTx(tx);
    setConfirmDialogOpen(true);
  };

  const openPayDebtFor = (debt: Debt) => {
    setPayingDebt(debt);
    setPayDebtOpen(true);
  };

  const openPayNowFor = (subscription: RecurringTransaction) => {
    setSelectedPayNowSub(subscription);
    setPayNowDialogOpen(true);
  };

  const openQuickActionForEvent = (event: CalendarEvent) => {
    if (event.status === "paid" || event.status === "completed") return;
    if (event.source === "debt" && event.debt) {
      openPayDebtFor(event.debt);
      return;
    }
    if (event.source === "pending" && event.pendingTx) {
      openConfirmFor(event.pendingTx);
      return;
    }
    if (event.source === "subscription" && event.subscription) {
      openPayNowFor(event.subscription);
    }
  };

  const openCreateSubscription = (type: "gasto" | "ingreso") => {
    setCreateSubscriptionType(type);
    setCreateSubscriptionOpen(true);
  };

  const openCreateDebt = (type: DebtType) => {
    setCreateDebtType(type);
    setCreateDebtOpen(true);
  };

  const renderPendingList = () => (
    <div className="space-y-3">
      {pendingTransactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay pagos pendientes por aprobar.</p>
      ) : (
        pendingTransactions.map((tx) => (
          <div key={tx.id} className="rounded-lg border border-destructive/30 bg-card p-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{tx.description || "Pago pendiente"}</p>
                <p className="text-xs text-muted-foreground">Fecha: {tx.date}</p>
              </div>
              <Badge variant="destructive">Pending</Badge>
            </div>
            <p className={cn("text-sm font-semibold", tx.type === "expense" ? "text-red-600" : "text-emerald-600")}>
              {formatAmountWithCurrency(tx.amount, tx.currency ?? "USD")}
            </p>
            <Button className="w-full h-11 text-base" onClick={() => openConfirmFor(tx)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Confirmar Pago Ahora
            </Button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <CalendarDays className="h-6 w-6" />
                Calendario Maestro
              </CardTitle>
              <CardDescription>
                Proyección mensual de cobros y pagos con aprobaciones pendientes en tiempo real.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando calendario...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[180px] text-center text-sm font-medium text-foreground capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[96px]" />
                  ))}

                  {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDate.get(key) ?? [];
                    const today = isToday(day);
                    const selected = selectedDate === key;

                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        className={cn(
                          "min-h-[60px] sm:min-h-[96px] rounded-md border border-border/50 p-2 text-left transition-colors",
                          today && "bg-accent/30 border-primary/40",
                          selected && "ring-2 ring-primary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-foreground",
                            today && "bg-primary text-primary-foreground",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className={cn(
                                "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                                ev.flow === "expense"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-emerald-100 text-emerald-800",
                              )}
                            >
                              {ev.label}
                            </div>
                          ))}
                          {dayEvents.length > 3 ? (
                            <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} más</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Mini-Dashboard del Día</CardTitle>
                  <CardDescription>{selectedDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg border border-border p-2">
                      <p className="text-muted-foreground">Ingresos</p>
                      <p className="font-semibold text-emerald-600">{formatAmountWithCurrency(selectedTotals.income, "USD")}</p>
                    </div>
                    <div className="rounded-lg border border-border p-2">
                      <p className="text-muted-foreground">Gastos</p>
                      <p className="font-semibold text-red-600">{formatAmountWithCurrency(selectedTotals.expense, "USD")}</p>
                    </div>
                  </div>
                  {selectedEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay movimientos para este día.</p>
                  ) : (
                    selectedEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border border-border p-2 space-y-2">
                        <p className="text-sm font-medium text-foreground truncate">{event.label}</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground capitalize">{event.source}</p>
                          {(event.status === "paid" || event.status === "completed") ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Completado</Badge>
                          ) : null}
                        </div>
                        <p className={cn("text-sm font-semibold", event.flow === "expense" ? "text-red-600" : "text-emerald-600")}>
                          {formatAmountWithCurrency(event.amount, event.currency)}
                        </p>
                        {event.status === "paid" || event.status === "completed" ? null : (
                          <Button
                            type="button"
                            className={cn("w-full", event.flow === "income" && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                            variant={event.flow === "expense" ? "destructive" : "default"}
                            onClick={() => openQuickActionForEvent(event)}
                          >
                            {event.flow === "expense" ? "Pagar ahora" : "Cobrar ahora"}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Aprobaciones Pendientes</CardTitle>
                  <CardDescription>{pendingTransactions.length} pagos por confirmar</CardDescription>
                </CardHeader>
                <CardContent>{renderPendingList()}</CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Acceso rápido</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => openCreateSubscription("gasto")}>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
            Nuevo Gasto Recurrente
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => openCreateSubscription("ingreso")}>
            <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
            Nuevo Ingreso Recurrente
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => openCreateDebt("payable")}>
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Nueva Deuda por Pagar
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => openCreateDebt("receivable")}>
            <HandCoins className="h-4 w-4 text-emerald-600" />
            Nuevo Dinero por Cobrar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmPaymentModal
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        pendingTx={selectedPendingTx}
        referenceCurrency={selectedPendingTx?.currency ?? "USD"}
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

      <DebtFormDialog
        open={createDebtOpen}
        onOpenChange={setCreateDebtOpen}
        debt={null}
        initialDate={selectedDate}
        initialType={createDebtType}
        lockType
        categories={categories}
        submitting={createDebtMutation.isPending}
        onSubmit={handleDebtCreate}
      />

      <SubscriptionCreateDialog
        open={createSubscriptionOpen}
        onOpenChange={setCreateSubscriptionOpen}
        initialType={createSubscriptionType}
        lockType
        onCreated={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: RECURRING_TRANSACTIONS_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY }),
          ]);
        }}
      />

      <DebtPayDialog
        open={payDebtOpen}
        onOpenChange={setPayDebtOpen}
        debt={payingDebt}
        accounts={accounts}
        categories={categories}
        onConfirm={async (payload) => {
          if (!payingDebt) return;
          await payDebtMutation.mutateAsync({ id: payingDebt.id, payload });
          setPayingDebt(null);
        }}
      />

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
    </div>
  );
}
