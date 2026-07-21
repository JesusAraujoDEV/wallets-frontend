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
import type { Debt } from "@/lib/types";

export function DeleteDebtDialog({
  open,
  onOpenChange,
  debt,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
  isPending: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-full max-w-md rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("debts.confirmDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("debts.confirmDeleteDescription", { contactName: debt?.contactName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <AlertDialogCancel className="w-full sm:w-auto">{t("debts.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("debts.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
