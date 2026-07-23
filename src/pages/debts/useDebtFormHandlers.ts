import type { DebtFormValues } from "@/components/DebtFormDialog";
import type { Debt } from "@/lib/types";
import type { useDebtCrudMutations } from "./useDebtCrudMutations";

export function useDebtFormHandlers({
  editingDebt,
  mutations,
}: {
  editingDebt: Debt | null;
  mutations: Pick<ReturnType<typeof useDebtCrudMutations>, "createMutation" | "updateMutation">;
}) {
  function handleFormSubmit(values: DebtFormValues) {
    const dueDate = values.dueDate || null;
    const categoryId = values.categoryId ? Number(values.categoryId) : null;
    const payload = {
      contactName: values.contactName.trim(),
      description: values.description.trim(),
      totalAmount: values.totalAmount,
      currency: values.currency,
      type: values.type,
      dueDate,
      categoryId,
    };

    if (editingDebt) {
      // Backend updateDebtSchema is unknown(false) and rejects type/currency (immutable post-creation).
      const { type: _type, currency: _currency, ...updatePayload } = payload;
      mutations.updateMutation.mutate({ id: editingDebt.id, payload: updatePayload });
      return;
    }
    mutations.createMutation.mutate(payload);
  }

  return { handleFormSubmit };
}
