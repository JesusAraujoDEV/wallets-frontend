import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  fetchRecurringTransactions,
  RECURRING_TRANSACTIONS_QUERY_KEY,
} from "@/lib/subscriptions";
import { DEBTS_QUERY_KEY, fetchDebts } from "@/lib/debts";
import type { Debt, RecurringTransaction } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type CalendarEvent = {
  id: string;
  label: string;
  date: string;
  type: "subscription" | "debt";
  variant: "default" | "destructive" | "secondary";
};

function buildEvents(
  subscriptions: RecurringTransaction[],
  debts: Debt[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const sub of subscriptions) {
    if (!sub.is_active || !sub.next_date) continue;
    events.push({
      id: `sub-${sub.id}`,
      label: sub.description,
      date: sub.next_date,
      type: "subscription",
      variant: sub.execution_mode === "manual" ? "destructive" : "secondary",
    });
  }

  for (const debt of debts) {
    if (debt.status === "paid" || !debt.dueDate) continue;
    events.push({
      id: `debt-${debt.id}`,
      label: `${debt.contactName}`,
      date: debt.dueDate,
      type: "debt",
      variant: debt.type === "payable" ? "destructive" : "default",
    });
  }

  return events;
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const subsQuery = useQuery({
    queryKey: RECURRING_TRANSACTIONS_QUERY_KEY,
    queryFn: fetchRecurringTransactions,
  });

  const debtsQuery = useQuery({
    queryKey: DEBTS_QUERY_KEY,
    queryFn: fetchDebts,
  });

  const events = useMemo(
    () => buildEvents(subsQuery.data ?? [], debtsQuery.data ?? []),
    [subsQuery.data, debtsQuery.data],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Monday-based offset (0=Mon, 6=Sun)
  const startOffset = useMemo(() => {
    const dow = getDay(days[0]); // 0=Sun
    return dow === 0 ? 6 : dow - 1;
  }, [days]);

  const isLoading = subsQuery.isLoading || debtsQuery.isLoading;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl text-card-foreground">
                <CalendarDays className="h-6 w-6" />
                Calendario
              </CardTitle>
              <CardDescription>
                Visualiza tus suscripciones y vencimientos de deudas en el mes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium text-foreground capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando calendario...
        </div>
      ) : (
        <Card className="border-border bg-card shadow-sm overflow-x-auto">
          <CardContent className="p-2 sm:p-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-px">
              {/* Empty cells for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[72px] sm:min-h-[90px]" />
              ))}

              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDate.get(key) ?? [];
                const today = isToday(day);
                const inMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[72px] sm:min-h-[90px] rounded-md border border-border/50 p-1 transition-colors",
                      today && "bg-accent/30 border-primary/40",
                      !inMonth && "opacity-40",
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
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <Badge
                          key={ev.id}
                          variant={ev.variant}
                          className="block w-full truncate text-[10px] px-1 py-0 leading-tight"
                        >
                          {ev.label}
                        </Badge>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{dayEvents.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
