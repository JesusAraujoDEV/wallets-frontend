import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { BudgetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatMoney, formatOriginalAmount, periodBadgeLabel, progressColorClass, rateSourceLabel } from "./formatters";

export function BudgetCard({ budget, isDeleting, onEdit, onDelete }: {
  budget: BudgetStatus;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const percentage = Math.max(0, Math.min(100, Number(budget.percentageUsed || 0)));
  const overBudget = Number(budget.remaining) < 0;
  const remainingAmount = Math.abs(Number(budget.remaining || 0));

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg"
              style={{ backgroundColor: budget.category.color ? `${budget.category.color}22` : "hsl(var(--muted))" }}
            >
              <CategoryIcon name={budget.category.icon} color={budget.category.color || "hsl(var(--chart-2))"} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-lg text-card-foreground">{budget.category.name}</CardTitle>
                <Badge variant="outline" className="whitespace-nowrap">
                  {periodBadgeLabel(budget.period, budget.specific_month)}
                </Badge>
                {rateSourceLabel(budget.rate_source) ? (
                  <Badge variant="secondary" className="whitespace-nowrap" title="Tasa de referencia del objetivo">
                    {rateSourceLabel(budget.rate_source)}
                  </Badge>
                ) : null}
              </div>
              <CardDescription>
                {formatMoney(Number(budget.spent || 0))} / {formatMoney(Number(budget.budgeted || 0))}
                {budget.budgeted_original != null
                  ? ` (meta: ${formatOriginalAmount(budget.budgeted_original, budget.rate_source)})`
                  : null}
              </CardDescription>
            </div>
          </div>

          <div className="hidden md:flex gap-2 items-center">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Editar presupuesto" onClick={onEdit} disabled={isDeleting}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Eliminar presupuesto" onClick={onDelete} disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Acciones del presupuesto" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem disabled={isDeleting} onSelect={(event) => { event.preventDefault(); onEdit(); }}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDeleting} className="text-destructive focus:text-destructive"
                  onSelect={(event) => { event.preventDefault(); onDelete(); }}
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Progress value={percentage} className={cn("h-3", progressColorClass(Number(budget.percentageUsed || 0)))} />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {Number(budget.percentageUsed || 0).toFixed(0)}% usado
          </p>
        </div>

        <p className={cn("text-sm font-medium", overBudget ? "text-red-600" : "text-emerald-600")}>
          {overBudget ? `Te excediste por ${formatMoney(remainingAmount)}` : `Te quedan ${formatMoney(remainingAmount)}`}
        </p>
      </CardContent>
    </Card>
  );
}
