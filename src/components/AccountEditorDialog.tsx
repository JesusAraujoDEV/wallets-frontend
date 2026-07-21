import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type AccountEditorValue = {
  name: string;
  currency: "USD" | "EUR" | "VES";
  balance: string; // keep as string for input control
};

export function AccountEditorDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  submitting,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AccountEditorValue;
  onChange: (next: AccountEditorValue) => void;
  onSubmit: () => void;
  submitting?: boolean;
  title?: string;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{title || t("accounts.editAccount")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">{t("accounts.accountName")}</Label>
            <Input
              id="accountName"
              type="text"
              placeholder={t("accounts.accountNamePlaceholder")}
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">{t("accounts.currency")}</Label>
            <Select value={value.currency} onValueChange={(v) => onChange({ ...value, currency: v as any })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">{t("accounts.usd")}</SelectItem>
                <SelectItem value="EUR">{t("accounts.eur")}</SelectItem>
                <SelectItem value="VES">{t("accounts.ves")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">{t("accounts.balance")}</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={value.balance}
              onChange={(e) => onChange({ ...value, balance: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={!!submitting}>
              {t("common.cancel")}
            </Button>
            <Button type="button" onClick={onSubmit} className="flex-1" disabled={!!submitting} aria-busy={!!submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("accounts.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
