import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetFormDialog } from "./budgets/BudgetFormDialog";
import { BudgetsListSection } from "./budgets/BudgetsListSection";
import { DeleteBudgetDialog } from "./budgets/DeleteBudgetDialog";
import { useBudgetFormDialog } from "./budgets/useBudgetFormDialog";
import { useBudgetsData } from "./budgets/useBudgetsData";
import { useBudgetSubmit } from "./budgets/useBudgetSubmit";
import { useDeleteBudget } from "./budgets/useDeleteBudget";

export default function Budgets() {
  const { t } = useTranslation();
  const { budgets, categories, loading, loadBudgetsData } = useBudgetsData();
  const {
    form, open, setOpen, editingBudget, isEditing, openCreateDialog, openEditDialog, handleOpenChange,
  } = useBudgetFormDialog();
  const { submitLoading, onSubmitBudget } = useBudgetSubmit({
    form, editingBudget, isEditing, onSuccess: () => handleOpenChange(false), reload: loadBudgetsData,
  });
  const {
    confirmDeleteBudgetId, setConfirmDeleteBudgetId, deletingBudgetId, budgetPendingDelete, handleDeleteBudget,
  } = useDeleteBudget(budgets, loadBudgetsData);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
  );

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl text-card-foreground">{t("budgets.title")}</CardTitle>
              <CardDescription>
                {t("budgets.subtitle")}
              </CardDescription>
            </div>
            <Button type="button" className="w-full sm:w-auto" onClick={openCreateDialog}>
              {t("budgets.create")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <BudgetsListSection
        loading={loading}
        budgets={budgets}
        deletingBudgetId={deletingBudgetId}
        onEdit={openEditDialog}
        onDelete={setConfirmDeleteBudgetId}
      />

      <BudgetFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        isEditing={isEditing}
        form={form}
        onSubmit={onSubmitBudget}
        submitLoading={submitLoading}
        expenseCategories={expenseCategories}
        onCancel={() => setOpen(false)}
      />

      <DeleteBudgetDialog
        open={confirmDeleteBudgetId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !deletingBudgetId) {
            setConfirmDeleteBudgetId(null);
          }
        }}
        budget={budgetPendingDelete}
        isDeleting={deletingBudgetId !== null}
        onConfirm={() => void handleDeleteBudget()}
      />
    </div>
  );
}
