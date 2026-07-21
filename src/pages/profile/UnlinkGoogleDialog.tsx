import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { useUnlinkGoogleDialog } from "./useUnlinkGoogleDialog";

export function UnlinkGoogleDialog({ state }: { state: ReturnType<typeof useUnlinkGoogleDialog> }) {
  const { t } = useTranslation();
  const { open, onOpenChange, password, setPassword, confirmPassword, setConfirmPassword, loading, unlink } = state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md overflow-x-hidden max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("auth.unlinkGoogle.title")}</DialogTitle>
          <DialogDescription>{t("auth.unlinkGoogle.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unlink-password">{t("auth.changePassword.newPasswordLabel")}</Label>
            <Input
              id="unlink-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.unlinkGoogle.newPasswordPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unlink-password-confirm">{t("auth.resetPassword.confirmPasswordLabel")}</Label>
            <Input
              id="unlink-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={t("auth.unlinkGoogle.confirmPasswordPlaceholder")}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={unlink} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("auth.common.saving")}
              </>
            ) : (
              t("auth.unlinkGoogle.title")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
