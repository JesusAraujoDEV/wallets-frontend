import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BudgetStatus } from "@/lib/types";

export function DeleteBudgetDialog({ open, onOpenChange, budget, isDeleting, onConfirm }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: BudgetStatus | null;
  isDeleting: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("budgets.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {budget
              ? t("budgets.delete.descriptionWithCategory", { category: budget.category.name })
              : t("budgets.delete.descriptionGeneric")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <AlertDialogCancel disabled={isDeleting}>{t("budgets.form.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("budgets.delete.deleting")}
              </span>
            ) : (
              t("budgets.delete.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
