import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Loader2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebtFormValues } from "@/components/DebtFormDialog";
import type { Debt, DebtType, RecurringTransaction, Transaction } from "@/lib/types";
import { CalendarDialogs } from "./calendar/CalendarDialogs";
import { CalendarGrid } from "./calendar/CalendarGrid";
import { DayDashboard } from "./calendar/DayDashboard";
import { PendingApprovalsSection } from "./calendar/PendingApprovalsSection";
import { QuickActionMenu } from "./calendar/QuickActionMenu";
import { useCalendarData } from "./calendar/useCalendarData";
import { useCalendarMonthState } from "./calendar/useCalendarMonthState";
import { useCalendarMutations } from "./calendar/useCalendarMutations";
import { useCalendarReferenceData } from "./calendar/useCalendarReferenceData";
import type { CalendarEvent } from "./calendar/types";

export default function CalendarView() {
  const { t } = useTranslation();
  const { accounts, categories } = useCalendarReferenceData();
  const { currentMonth, setCurrentMonth, selectedDate, setSelectedDate, days, startOffset } = useCalendarMonthState();
  const { isLoading, eventsByDate, pendingTransactions } = useCalendarData(categories);
  const mutations = useCalendarMutations();

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

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];
  const selectedTotals = selectedEvents.reduce(
    (acc, event) => {
      if (event.flow === "income") acc.income += event.amount;
      else acc.expense += event.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );

  const handleDebtCreate = async (values: DebtFormValues) => {
    await mutations.createDebtMutation.mutateAsync({
      contactName: values.contactName.trim(),
      description: values.description.trim(),
      totalAmount: values.totalAmount,
      currency: values.currency,
      type: values.type,
      dueDate: values.dueDate || null,
      categoryId: values.categoryId ? Number(values.categoryId) : null,
    });
    setCreateDebtOpen(false);
  };

  const openQuickActionForEvent = (event: CalendarEvent) => {
    if (event.status === "paid" || event.status === "completed") return;
    if (event.source === "debt" && event.debt) {
      setPayingDebt(event.debt);
      setPayDebtOpen(true);
      return;
    }
    if (event.source === "pending" && event.pendingTx) {
      setSelectedPendingTx(event.pendingTx);
      setConfirmDialogOpen(true);
      return;
    }
    if (event.source === "subscription" && event.subscription) {
      setSelectedPayNowSub(event.subscription);
      setPayNowDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <CalendarDays className="h-6 w-6" />
                {t("calendar.title")}
              </CardTitle>
              <CardDescription>
                {t("calendar.subtitle")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t("calendar.loading")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
          <CalendarGrid
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            days={days}
            startOffset={startOffset}
            eventsByDate={eventsByDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <div className="space-y-4">
            <DayDashboard
              selectedDate={selectedDate}
              selectedEvents={selectedEvents}
              selectedTotals={selectedTotals}
              onQuickAction={openQuickActionForEvent}
            />
            <PendingApprovalsSection
              pendingTransactions={pendingTransactions}
              onConfirm={(tx) => {
                setSelectedPendingTx(tx);
                setConfirmDialogOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <QuickActionMenu
        onCreateSubscription={(type) => {
          setCreateSubscriptionType(type);
          setCreateSubscriptionOpen(true);
        }}
        onCreateDebt={(type) => {
          setCreateDebtType(type);
          setCreateDebtOpen(true);
        }}
      />

      <CalendarDialogs
        accounts={accounts}
        categories={categories}
        selectedDate={selectedDate}
        mutations={mutations}
        onDebtCreate={handleDebtCreate}
        confirmDialogOpen={confirmDialogOpen} setConfirmDialogOpen={setConfirmDialogOpen}
        selectedPendingTx={selectedPendingTx} setSelectedPendingTx={setSelectedPendingTx}
        createDebtOpen={createDebtOpen} setCreateDebtOpen={setCreateDebtOpen} createDebtType={createDebtType}
        createSubscriptionOpen={createSubscriptionOpen} setCreateSubscriptionOpen={setCreateSubscriptionOpen} createSubscriptionType={createSubscriptionType}
        payDebtOpen={payDebtOpen} setPayDebtOpen={setPayDebtOpen} payingDebt={payingDebt} setPayingDebt={setPayingDebt}
        payNowDialogOpen={payNowDialogOpen} setPayNowDialogOpen={setPayNowDialogOpen}
        selectedPayNowSub={selectedPayNowSub} setSelectedPayNowSub={setSelectedPayNowSub}
      />
    </div>
  );
}
