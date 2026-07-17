import { Loader2 } from "lucide-react";
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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:w-full max-w-md rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar deuda?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la deuda de {debt?.contactName}. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
