import { CreditCard, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import type { RecurringTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { modeLabelKey } from "./types";

export function SubscriptionCard({ item, isToggling, onToggleActive, onPayNow, onEdit, onDelete }: {
  item: RecurringTransaction;
  isToggling: boolean;
  onToggleActive: (checked: boolean) => void;
  onPayNow: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className={cn("border-border bg-card", !item.is_active && "opacity-60")}>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{item.description}</p>
            <p className="text-sm text-muted-foreground">
              {t("subscriptions.nextPaymentFrequency", { date: item.next_date, frequency: item.frequency })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.execution_mode === "manual" ? "destructive" : "secondary"}>{t(modeLabelKey(item.execution_mode))}</Badge>
            <Badge variant={item.is_active ? "default" : "outline"}>{item.is_active ? t("subscriptions.active") : t("subscriptions.paused")}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-foreground">{formatAmountWithCurrency(item.amount, item.currency)}</p>
          <div className="flex items-center gap-3">
            <Label htmlFor={`active-${item.id}`} className="text-sm text-muted-foreground">
              {item.is_active ? t("subscriptions.pause") : t("subscriptions.resume")}
            </Label>
            <Switch
              id={`active-${item.id}`}
              checked={item.is_active}
              onCheckedChange={onToggleActive}
              onClick={(e) => e.stopPropagation()}
              disabled={isToggling}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button" variant="default" size="sm" className="w-full sm:w-auto"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onPayNow(); }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t("subscriptions.payNow")}
          </Button>

          <div className="hidden items-center gap-1 md:flex">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label={t("subscriptions.editAria")}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} aria-label={t("subscriptions.deleteAria")}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{t("subscriptions.moreOptions")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("subscriptions.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("subscriptions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
