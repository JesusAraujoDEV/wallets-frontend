import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

export function SubscriptionCreateDialogFooter({
  onCancel,
  isPending,
}: {
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-3">
      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Guardar Suscripción
      </Button>
    </DialogFooter>
  );
}
