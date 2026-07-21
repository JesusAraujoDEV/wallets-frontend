import { ListPlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { CategoryGroup } from "@/lib/types";

export function GroupRow({ group, isDeleting, onAssign, onEdit, onDelete }: {
  group: CategoryGroup;
  isDeleting: boolean;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-card-foreground">{group.name}</p>
        <p className="text-sm text-muted-foreground">{t("categoryGroups.row.type", { type: group.type })}</p>
        <p className="text-sm text-muted-foreground">
          {t("categoryGroups.row.stats", {
            behavior: group.analyticsBehavior === "include" ? t("categoryGroups.row.include") : t("categoryGroups.row.exclude"),
          })}
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
        <Button variant="secondary" className="w-full sm:w-auto" onClick={onAssign}>
          <ListPlus className="mr-2 h-4 w-4" />
          {t("categoryGroups.assign.title")}
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("categoryGroups.row.edit")}
        </Button>
        <Button variant="destructive" className="w-full sm:w-auto" onClick={onDelete} disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {t("categoryGroups.row.delete")}
        </Button>
      </div>
    </div>
  );
}
