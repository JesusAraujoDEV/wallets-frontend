import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Account, Category, Debt } from "@/lib/types";
import { SubscriptionBasicFields } from "./SubscriptionBasicFields";
import { SubscriptionScheduleFields } from "./SubscriptionScheduleFields";
import type { CreateSubscriptionForm } from "./types";

export function CreateSubscriptionDialog({ open, onOpenChange, form, onSubmit, isPending, accounts, categories, activeDebts }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  form: UseFormReturn<CreateSubscriptionForm>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  accounts: Account[]; categories: Category[]; activeDebts: Debt[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>Crear nueva suscripción</DialogTitle>
          <DialogDescription>
            Define la regla de cobro, elige si será auto-pago o confirmación manual y activa la recurrencia.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <SubscriptionBasicFields form={form} idPrefix="create" accounts={accounts} categories={categories} activeDebts={activeDebts} />
          <SubscriptionScheduleFields form={form} idPrefix="create" />

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Suscripción
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
