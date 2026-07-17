import { useQueryClient } from "@tanstack/react-query";
import { ConfirmPaymentModal } from "@/components/ConfirmPaymentModal";
import { DebtFormDialog, type DebtFormValues } from "@/components/DebtFormDialog";
import { DebtPayDialog } from "@/components/DebtPayDialog";
import { PayNowModal } from "@/components/PayNowModal";
import { SubscriptionCreateDialog } from "@/components/SubscriptionCreateDialog";
import { DEBTS_QUERY_KEY } from "@/lib/debts";
import { PENDING_TRANSACTIONS_QUERY_KEY, RECURRING_TRANSACTIONS_QUERY_KEY } from "@/lib/subscriptions";
import type { Account, Category, Debt, DebtType, RecurringTransaction, Transaction } from "@/lib/types";
import type { useCalendarMutations } from "./useCalendarMutations";

export function CalendarDialogs({
  accounts,
  categories,
  selectedDate,
  mutations,
  onDebtCreate,
  confirmDialogOpen, setConfirmDialogOpen, selectedPendingTx, setSelectedPendingTx,
  createDebtOpen, setCreateDebtOpen, createDebtType,
  createSubscriptionOpen, setCreateSubscriptionOpen, createSubscriptionType,
  payDebtOpen, setPayDebtOpen, payingDebt, setPayingDebt,
  payNowDialogOpen, setPayNowDialogOpen, selectedPayNowSub, setSelectedPayNowSub,
}: {
  accounts: Account[];
  categories: Category[];
  selectedDate: string;
  mutations: ReturnType<typeof useCalendarMutations>;
  onDebtCreate: (values: DebtFormValues) => Promise<void>;
  confirmDialogOpen: boolean; setConfirmDialogOpen: (open: boolean) => void;
  selectedPendingTx: Transaction | null; setSelectedPendingTx: (tx: Transaction | null) => void;
  createDebtOpen: boolean; setCreateDebtOpen: (open: boolean) => void; createDebtType: DebtType;
  createSubscriptionOpen: boolean; setCreateSubscriptionOpen: (open: boolean) => void; createSubscriptionType: "gasto" | "ingreso";
  payDebtOpen: boolean; setPayDebtOpen: (open: boolean) => void; payingDebt: Debt | null; setPayingDebt: (debt: Debt | null) => void;
  payNowDialogOpen: boolean; setPayNowDialogOpen: (open: boolean) => void;
  selectedPayNowSub: RecurringTransaction | null; setSelectedPayNowSub: (sub: RecurringTransaction | null) => void;
}) {
  const queryClient = useQueryClient();
  const { createDebtMutation, payDebtMutation, payNowMutation } = mutations;

  return (
    <>
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
        onSubmit={onDebtCreate}
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
    </>
  );
}
