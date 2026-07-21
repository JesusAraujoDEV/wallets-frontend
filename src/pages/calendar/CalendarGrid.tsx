import { addMonths, format, isToday, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "./types";

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function CalendarGrid({
  currentMonth,
  setCurrentMonth,
  days,
  startOffset,
  eventsByDate,
  selectedDate,
  setSelectedDate,
}: {
  currentMonth: Date;
  setCurrentMonth: (updater: (month: Date) => Date) => void;
  days: Date[];
  startOffset: number;
  eventsByDate: Map<string, CalendarEvent[]>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            aria-label={t("calendar.grid.previousMonth")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center text-sm font-medium text-foreground capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            aria-label={t("calendar.grid.nextMonth")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} className="text-center text-xs font-medium text-muted-foreground py-2">
              {t(`calendar.grid.weekday.${key}`)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[96px]" />
          ))}

          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = eventsByDate.get(key) ?? [];
            const today = isToday(day);
            const selected = selectedDate === key;

            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedDate(key)}
                className={cn(
                  "min-h-[60px] sm:min-h-[96px] rounded-md border border-border/50 p-2 text-left transition-colors",
                  today && "bg-accent/30 border-primary/40",
                  selected && "ring-2 ring-primary/50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-foreground",
                    today && "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className={cn(
                        "truncate rounded px-1.5 py-0.5 text-[10px] font-medium",
                        ev.flow === "expense"
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800",
                      )}
                    >
                      {ev.label}
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <span className="text-[10px] text-muted-foreground">
                      {t("calendar.grid.moreCount", { count: dayEvents.length - 3 })}
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
