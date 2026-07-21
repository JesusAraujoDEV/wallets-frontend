import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category, CategoryGroup } from "@/lib/types";

export function AssignCategoriesDialog({
  open, onOpenChange, assigningGroup, categories, selectedCategoryIds, loadingCategories, savingAssignment,
  onToggleCategory, onCancel, onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assigningGroup: CategoryGroup | null;
  categories: Category[];
  selectedCategoryIds: number[];
  loadingCategories: boolean;
  savingAssignment: boolean;
  onToggleCategory: (categoryId: number, checked: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{t("categoryGroups.assign.title")}</DialogTitle>
          <DialogDescription>
            {assigningGroup
              ? t("categoryGroups.assign.descriptionWithGroup", { group: assigningGroup.name })
              : t("categoryGroups.assign.descriptionGeneric")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loadingCategories ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("categoryGroups.assign.loading")}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("categoryGroups.assign.emptyForType", { type: assigningGroup?.type })}
            </p>
          ) : (
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
              {categories.map((category) => {
                const categoryId = Number(category.id);
                const isChecked = selectedCategoryIds.includes(categoryId);

                return (
                  <label
                    key={category.id}
                    htmlFor={`assign-category-${category.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-accent"
                  >
                    <Checkbox
                      id={`assign-category-${category.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => onToggleCategory(categoryId, checked === true)}
                    />
                    <div
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <CategoryIcon name={category.icon} color={category.color} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-card-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.type === "income" ? t("categoryGroups.assign.income") : t("categoryGroups.assign.expense")}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={savingAssignment}>{t("categoryGroups.assign.cancel")}</Button>
          <Button onClick={onSave} disabled={savingAssignment || !assigningGroup} aria-busy={savingAssignment}>
            {savingAssignment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("categoryGroups.assign.saving")}
              </>
            ) : (
              t("categoryGroups.assign.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
