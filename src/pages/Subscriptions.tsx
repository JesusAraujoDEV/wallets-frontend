import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmPaymentModal } from "@/components/ConfirmPaymentModal";
import { PayNowModal } from "@/components/PayNowModal";
import type { RecurringTransaction, Transaction } from "@/lib/types";
import { CreateSubscriptionDialog } from "./subscriptions/CreateSubscriptionDialog";
import { EditSubscriptionDialog } from "./subscriptions/EditSubscriptionDialog";
import { DeleteSubscriptionDialog } from "./subscriptions/DeleteSubscriptionDialog";
import { PendingPaymentsSection } from "./subscriptions/PendingPaymentsSection";
import { SubscriptionsListSection } from "./subscriptions/SubscriptionsListSection";
import { useSubscriptionsReferenceData } from "./subscriptions/useSubscriptionsReferenceData";
import { useSubscriptionQueries } from "./subscriptions/useSubscriptionQueries";
import { useSubscriptionCrudMutations } from "./subscriptions/useSubscriptionCrudMutations";
import { usePayNowMutation } from "./subscriptions/usePayNowMutation";
import { useSubscriptionFormHandlers } from "./subscriptions/useSubscriptionFormHandlers";
import { DEFAULT_SUBSCRIPTION_FORM_VALUES, type CreateSubscriptionForm } from "./subscriptions/types";

export default function Subscriptions() {
  const { t } = useTranslation();
  const { accounts, categories, activeDebts } = useSubscriptionsReferenceData();
  const { pendingQuery, recurringQuery, pendingTransactions, recurringTransactions } = useSubscriptionQueries();
  const mutations = useSubscriptionCrudMutations();
  const payNowMutation = usePayNowMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPendingTx, setSelectedPendingTx] = useState<Transaction | null>(null);
  const [payNowDialogOpen, setPayNowDialogOpen] = useState(false);
  const [selectedPayNowSub, setSelectedPayNowSub] = useState<RecurringTransaction | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<RecurringTransaction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<RecurringTransaction | null>(null);

  const createForm = useForm<CreateSubscriptionForm>({ defaultValues: DEFAULT_SUBSCRIPTION_FORM_VALUES });
  const editForm = useForm<CreateSubscriptionForm>({ defaultValues: DEFAULT_SUBSCRIPTION_FORM_VALUES });

  const { openEditDialog, onSubmitCreate, onSubmitEdit } = useSubscriptionFormHandlers({
    createForm, editForm, mutations, editingSubscription, setEditingSubscription, setEditDialogOpen, setCreateDialogOpen,
  });

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <Repeat className="h-6 w-6" />
                {t("subscriptions.title")}
              </CardTitle>
              <CardDescription>
                {t("subscriptions.description")}
              </CardDescription>
            </div>
            <Button type="button" className="w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("subscriptions.newSubscription")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <PendingPaymentsSection
        isLoading={pendingQuery.isLoading}
        pendingTransactions={pendingTransactions}
        onConfirm={(tx) => { setSelectedPendingTx(tx); setConfirmDialogOpen(true); }}
      />

      <SubscriptionsListSection
        isLoading={recurringQuery.isLoading}
        items={recurringTransactions}
        togglingId={mutations.togglingId}
        onToggleActive={(id, isActive) => mutations.toggleActiveMutation.mutate({ id, isActive })}
        onPayNow={(item) => { setSelectedPayNowSub(item); setPayNowDialogOpen(true); }}
        onEdit={openEditDialog}
        onDelete={(item) => { setDeletingSubscription(item); setDeleteConfirmOpen(true); }}
      />

      <CreateSubscriptionDialog
        open={createDialogOpen} onOpenChange={setCreateDialogOpen}
        form={createForm} onSubmit={onSubmitCreate} isPending={mutations.createMutation.isPending}
        accounts={accounts} categories={categories} activeDebts={activeDebts}
      />

      <ConfirmPaymentModal
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        pendingTx={selectedPendingTx}
        referenceCurrency={selectedPendingTx?.currency as "USD" | "EUR" | "VES" ?? "USD"}
        referenceAmount={selectedPendingTx?.amount ?? 0}
        accounts={accounts}
        onConfirmed={async () => {
          setSelectedPendingTx(null);
          await Promise.all([pendingQuery.refetch(), recurringQuery.refetch()]);
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
            payload: { accountId: payload.accountId, date: payload.date, amount: payload.amount, currency: payload.currency },
          });
          setSelectedPayNowSub(null);
        }}
      />

      <EditSubscriptionDialog
        open={editDialogOpen}
        onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingSubscription(null); }}
        form={editForm} onSubmit={onSubmitEdit} isPending={mutations.updateMutation.isPending}
        accounts={accounts} categories={categories} activeDebts={activeDebts}
      />

      <DeleteSubscriptionDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => { setDeleteConfirmOpen(open); if (!open) setDeletingSubscription(null); }}
        subscription={deletingSubscription}
        isPending={mutations.deleteMutation.isPending}
        onConfirm={() => { if (deletingSubscription) mutations.deleteMutation.mutate(deletingSubscription.id); }}
      />
    </div>
  );
}
