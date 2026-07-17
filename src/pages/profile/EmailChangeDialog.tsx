import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { OtpBoxesInput } from "./OtpBoxesInput";
import type { useEmailChangeDialog } from "./useEmailChangeDialog";

export function EmailChangeDialog({ state }: { state: ReturnType<typeof useEmailChangeDialog> }) {
  const { open, onOpenChange, step, loading } = state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md overflow-x-hidden max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cambiar correo</DialogTitle>
          <DialogDescription>Completa el flujo de seguridad con OTP para actualizar tu correo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="otp-current-password">Contraseña actual</Label>
              <Input
                id="otp-current-password"
                type="password"
                value={state.currentPassword}
                onChange={(event) => state.setCurrentPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp-old-email-code">Codigo OTP (correo actual)</Label>
                <OtpBoxesInput
                  idPrefix="otp-old-email-code"
                  value={state.oldEmailCodeDigits}
                  onChange={state.setOldEmailCodeDigits}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-new-email">Nuevo correo</Label>
                <Input
                  id="otp-new-email"
                  type="email"
                  value={state.newEmail}
                  onChange={(event) => state.setNewEmail(event.target.value)}
                  placeholder="nuevo@email.com"
                />
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="rounded-lg border border-border bg-muted p-3 text-sm text-foreground">
                Confirmando nuevo correo: <span className="font-medium">{state.newEmail}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp-new-email-code">Codigo OTP (nuevo correo)</Label>
                <OtpBoxesInput
                  idPrefix="otp-new-email-code"
                  value={state.newEmailCodeDigits}
                  onChange={state.setNewEmailCodeDigits}
                  disabled={loading}
                />
              </div>
            </>
          ) : null}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>

          {step === 1 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={state.requestChange} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Continuar"
              )}
            </Button>
          ) : null}

          {step === 2 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={state.verifyOldOtp} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                "Verificar codigo"
              )}
            </Button>
          ) : null}

          {step === 3 ? (
            <Button type="button" className="w-full sm:w-auto" onClick={state.confirmNewEmail} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar correo"
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
