import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CategoryGroup } from "@/lib/types";
import type { GroupForm } from "./types";

export function GroupFormDialog({ open, onOpenChange, editingGroup, form, setForm, saving, onSubmit, onCancel }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: CategoryGroup | null;
  form: GroupForm;
  setForm: (updater: (prev: GroupForm) => GroupForm) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{editingGroup ? t("categoryGroups.form.editTitle") : t("categoryGroups.form.createTitle")}</DialogTitle>
          <DialogDescription>
            {editingGroup
              ? t("categoryGroups.form.editDescription")
              : t("categoryGroups.form.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">{t("categoryGroups.form.name")}</Label>
            <Input
              id="group-name"
              placeholder={t("categoryGroups.form.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-type">{t("categoryGroups.form.type")}</Label>
            <Select
              value={form.type}
              onValueChange={(value: "ingreso" | "gasto" | "neutral") => setForm((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger id="group-type">
                <SelectValue placeholder={t("categoryGroups.form.typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">{t("categoryGroups.form.typeIncome")}</SelectItem>
                <SelectItem value="gasto">{t("categoryGroups.form.typeExpense")}</SelectItem>
                <SelectItem value="neutral">{t("categoryGroups.form.typeNeutral")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-analytics">{t("categoryGroups.form.analyticsLabel")}</Label>
            <Select
              value={form.analyticsBehavior}
              onValueChange={(value: "include" | "exclude") => setForm((prev) => ({ ...prev, analyticsBehavior: value }))}
            >
              <SelectTrigger id="group-analytics">
                <SelectValue placeholder={t("categoryGroups.form.analyticsPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">{t("categoryGroups.form.analyticsInclude")}</SelectItem>
                <SelectItem value="exclude">{t("categoryGroups.form.analyticsExclude")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>{t("categoryGroups.form.cancel")}</Button>
          <Button onClick={onSubmit} disabled={saving} aria-busy={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("categoryGroups.form.saving")}
              </>
            ) : (
              t("categoryGroups.form.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
