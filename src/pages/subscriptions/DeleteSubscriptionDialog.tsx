import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { RecurringTransaction } from "@/lib/types";

export function DeleteSubscriptionDialog({ open, onOpenChange, subscription, isPending, onConfirm }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  subscription: RecurringTransaction | null;
  isPending: boolean;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("subscriptions.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("subscriptions.deleteDescriptionPrefix")}{" "}
            <span className="font-semibold">{subscription?.description}</span>. {t("subscriptions.deleteDescriptionSuffix")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("subscriptions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t("subscriptions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
