import type { UseFormReturn } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import type { RecurringTransaction } from "@/lib/types";
import { DEFAULT_SUBSCRIPTION_FORM_VALUES, type CreateSubscriptionForm } from "./types";
import type { useSubscriptionCrudMutations } from "./useSubscriptionCrudMutations";

export function useSubscriptionFormHandlers({
  createForm, editForm, mutations, editingSubscription, setEditingSubscription, setEditDialogOpen, setCreateDialogOpen,
}: {
  createForm: UseFormReturn<CreateSubscriptionForm>;
  editForm: UseFormReturn<CreateSubscriptionForm>;
  mutations: ReturnType<typeof useSubscriptionCrudMutations>;
  editingSubscription: RecurringTransaction | null;
  setEditingSubscription: (v: RecurringTransaction | null) => void;
  setEditDialogOpen: (v: boolean) => void;
  setCreateDialogOpen: (v: boolean) => void;
}) {
  const { toast } = useToast();

  function openEditDialog(sub: RecurringTransaction) {
    setEditingSubscription(sub);
    editForm.reset({
      description: sub.description, amount: sub.amount, frequency: sub.frequency, next_date: sub.next_date,
      execution_mode: sub.execution_mode, is_active: sub.is_active, categoryId: sub.categoryId, accountId: sub.accountId,
      currency: sub.currency, debtId: sub.debtId || "", subscriptionType: "gasto",
    });
    setEditDialogOpen(true);
  }

  const onSubmitCreate = createForm.handleSubmit((values) => {
    if (!values.categoryId) {
      toast({ title: "Campos incompletos", description: "Selecciona una categoría para crear la suscripción.", variant: "destructive" });
      return;
    }
    mutations.createMutation.mutate({
      description: values.description.trim(), amount: Number(values.amount), frequency: values.frequency,
      next_date: values.next_date, start_date: values.next_date, type: values.subscriptionType,
      execution_mode: values.execution_mode, is_active: values.is_active, categoryId: Number(values.categoryId),
      accountId: values.accountId ? Number(values.accountId) : undefined, currency: values.currency,
      debtId: values.debtId ? Number(values.debtId) : null,
    }, { onSuccess: () => { setCreateDialogOpen(false); createForm.reset(DEFAULT_SUBSCRIPTION_FORM_VALUES); } });
  });

  const onSubmitEdit = editForm.handleSubmit((values) => {
    if (!editingSubscription) return;
    const dirty = editForm.formState.dirtyFields;
    if (Object.keys(dirty).length === 0) {
      setEditDialogOpen(false);
      setEditingSubscription(null);
      return;
    }
    if (dirty.categoryId && !values.categoryId) {
      toast({ title: "Campos incompletos", description: "Selecciona una categoría.", variant: "destructive" });
      return;
    }

    const payload: Parameters<typeof mutations.updateMutation.mutate>[0]["payload"] = {};
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
    if (dirty.subscriptionType) payload.type = values.subscriptionType;

    mutations.updateMutation.mutate({ id: editingSubscription.id, payload }, {
      onSuccess: () => { setEditDialogOpen(false); setEditingSubscription(null); },
    });
  });

  return { openEditDialog, onSubmitCreate, onSubmitEdit };
}
