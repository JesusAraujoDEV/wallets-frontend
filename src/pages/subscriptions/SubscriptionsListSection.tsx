import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecurringTransaction } from "@/lib/types";
import { SubscriptionCard } from "./SubscriptionCard";

export function SubscriptionsListSection({ isLoading, items, togglingId, onToggleActive, onPayNow, onEdit, onDelete }: {
  isLoading: boolean; items: RecurringTransaction[]; togglingId: string | null;
  onToggleActive: (id: string, checked: boolean) => void;
  onPayNow: (item: RecurringTransaction) => void;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t("subscriptions.managementTitle")}</CardTitle>
        <CardDescription>
          {t("subscriptions.managementDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("subscriptions.loading")}
          </div>
        ) : items.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("subscriptions.noneTitle")}</AlertTitle>
            <AlertDescription>{t("subscriptions.noneDescription")}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <SubscriptionCard
                key={item.id}
                item={item}
                isToggling={togglingId === item.id}
                onToggleActive={(checked) => onToggleActive(item.id, checked)}
                onPayNow={() => onPayNow(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
