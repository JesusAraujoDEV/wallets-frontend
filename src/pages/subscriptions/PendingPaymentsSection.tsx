import { AlertCircle, CalendarClock, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import type { Transaction } from "@/lib/types";

export function PendingPaymentsSection({ isLoading, pendingTransactions, onConfirm }: {
  isLoading: boolean; pendingTransactions: Transaction[]; onConfirm: (tx: Transaction) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t("subscriptions.paymentAlertsTitle")}</CardTitle>
        <CardDescription>{t("subscriptions.paymentAlertsDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("subscriptions.loadingPending")}
          </div>
        ) : pendingTransactions.length > 0 ? (
          <>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("subscriptions.pendingCountTitle", { count: pendingTransactions.length })}</AlertTitle>
              <AlertDescription>
                {t("subscriptions.pendingCountDescription")}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {pendingTransactions.map((tx) => (
                <Card key={tx.id} className="border-destructive/30">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{tx.description || t("subscriptions.recurringPayment")}</p>
                        <p className="text-xs text-muted-foreground">{t("subscriptions.scheduledDate", { date: tx.date })}</p>
                      </div>
                      <Badge variant="destructive">{t("subscriptions.pending")}</Badge>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {formatAmountWithCurrency(tx.amount, (tx.currency as "USD" | "EUR" | "VES") || "USD")}
                      </p>
                      <Button type="button" className="w-full sm:w-auto" onClick={() => onConfirm(tx)}>
                        {t("subscriptions.confirmPayment")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Alert>
            <CalendarClock className="h-4 w-4" />
            <AlertTitle>{t("subscriptions.noPendingTitle")}</AlertTitle>
            <AlertDescription>
              {t("subscriptions.noPendingDescription")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
