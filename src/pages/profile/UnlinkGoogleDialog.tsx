import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { useUnlinkGoogleDialog } from "./useUnlinkGoogleDialog";

export function UnlinkGoogleDialog({ state }: { state: ReturnType<typeof useUnlinkGoogleDialog> }) {
  const { open, onOpenChange, password, setPassword, confirmPassword, setConfirmPassword, loading, unlink } = state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md overflow-x-hidden max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Desvincular Google</DialogTitle>
          <DialogDescription>Define una contraseña para continuar con autenticación local.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlink-password">Nueva contraseña</Label>
            <Input
              id="unlink-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa una contraseña"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unlink-password-confirm">Confirmar contraseña</Label>
            <Input
              id="unlink-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repite la contraseña"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={unlink} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Desvincular Google"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
