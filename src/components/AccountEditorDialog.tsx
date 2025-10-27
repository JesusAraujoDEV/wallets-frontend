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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title || "Edit Account"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              type="text"
              placeholder="e.g., Checking, Savings, Cash"
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={value.currency} onValueChange={(v) => onChange({ ...value, currency: v as any })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="VES">VES - Venezuelan Bolívar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Balance</Label>
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
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} className="flex-1" disabled={!!submitting} aria-busy={!!submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
