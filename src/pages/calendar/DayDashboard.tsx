import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountWithCurrency } from "@/components/ConfirmPaymentModal";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "./types";

export function DayDashboard({
  selectedDate,
  selectedEvents,
  selectedTotals,
  onQuickAction,
}: {
  selectedDate: string;
  selectedEvents: CalendarEvent[];
  selectedTotals: { income: number; expense: number };
  onQuickAction: (event: CalendarEvent) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("calendar.dayDashboard.title")}</CardTitle>
        <CardDescription>{selectedDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border border-border p-2">
            <p className="text-muted-foreground">{t("calendar.dayDashboard.income")}</p>
            <p className="font-semibold text-emerald-600">{formatAmountWithCurrency(selectedTotals.income, "USD")}</p>
          </div>
          <div className="rounded-lg border border-border p-2">
            <p className="text-muted-foreground">{t("calendar.dayDashboard.expense")}</p>
            <p className="font-semibold text-red-600">{formatAmountWithCurrency(selectedTotals.expense, "USD")}</p>
          </div>
        </div>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("calendar.dayDashboard.empty")}</p>
        ) : (
          selectedEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-border p-2 space-y-2">
              <p className="text-sm font-medium text-foreground truncate">{event.label}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground capitalize">{event.source}</p>
                {(event.status === "paid" || event.status === "completed") ? (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">{t("calendar.dayDashboard.completed")}</Badge>
                ) : null}
              </div>
              <p className={cn("text-sm font-semibold", event.flow === "expense" ? "text-red-600" : "text-emerald-600")}>
                {formatAmountWithCurrency(event.amount, event.currency)}
              </p>
              {event.status === "paid" || event.status === "completed" ? null : (
                <Button
                  type="button"
                  className={cn("w-full", event.flow === "income" && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                  variant={event.flow === "expense" ? "destructive" : "default"}
                  onClick={() => onQuickAction(event)}
                >
                  {event.flow === "expense" ? t("calendar.dayDashboard.payNow") : t("calendar.dayDashboard.collectNow")}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
