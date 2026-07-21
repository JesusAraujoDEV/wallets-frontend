import { Loader2, PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import type { BudgetStatus } from "@/lib/types";
import { BudgetCard } from "./BudgetCard";

export function BudgetsListSection({ loading, budgets, deletingBudgetId, onEdit, onDelete }: {
  loading: boolean;
  budgets: BudgetStatus[];
  deletingBudgetId: string | null;
  onEdit: (budget: BudgetStatus) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex min-h-44 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("budgets.list.loading")}
        </CardContent>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
          <PiggyBank className="h-10 w-10 text-emerald-600" />
          <div>
            <p className="text-base font-semibold text-foreground">{t("budgets.list.emptyTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("budgets.list.emptyDescription")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          isDeleting={deletingBudgetId === budget.id}
          onEdit={() => onEdit(budget)}
          onDelete={() => onDelete(budget.id)}
        />
      ))}
    </div>
  );
}
