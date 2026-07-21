import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDayTooltip } from "./CalendarDayTooltip";
import type { CalendarDay } from "./types";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

interface CalendarGridProps {
  days: Array<CalendarDay | null>;
  selectedDate: string | null;
  colorFor: (item: CalendarDay) => string;
  dailyIncome: Record<string, number>;
  dailyExpense: Record<string, number>;
  dailyCountIncome: Record<string, number>;
  dailyCountExpense: Record<string, number>;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({
  days, selectedDate, colorFor, dailyIncome, dailyExpense, dailyCountIncome, dailyCountExpense, onSelectDate,
}: CalendarGridProps) {
  const { t } = useTranslation();
  const today = dayjs().format('YYYY-MM-DD');

  return (
    <div className="grid grid-cols-7 gap-px sm:gap-1 rounded-lg overflow-hidden sm:overflow-visible bg-border sm:bg-transparent">
      {/* Weekday headers */}
      {WEEKDAY_KEYS.map((key) => (
        <div key={key} className="bg-muted/50 sm:bg-transparent py-2 text-center text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {t(`transactionsCalendar.weekday.${key}`)}
        </div>
      ))}

      {/* Day cells */}
      {days.map((item, idx) => item ? (
        <TooltipProvider key={idx} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "relative flex flex-col items-end justify-start p-1 sm:p-1.5 bg-card transition-all",
                  "min-h-[44px] sm:min-h-[56px] md:min-h-[64px]",
                  "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none",
                  selectedDate === item.date && "ring-2 ring-primary bg-primary/5",
                  item.date === today && "border-b-2 border-b-primary",
                )}
                style={{ backgroundColor: selectedDate === item.date ? undefined : colorFor(item) }}
                onClick={() => onSelectDate(item.date)}
              >
                {/* Day number */}
                <span className={cn(
                  "text-xs sm:text-sm font-medium leading-none",
                  item.date === today && "bg-primary text-primary-foreground rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs",
                )}>
                  {dayjs(item.date).date()}
                </span>

                {/* Mini amounts on desktop */}
                {(dailyIncome[item.date] > 0 || dailyExpense[item.date] > 0) && (
                  <div className="hidden sm:flex flex-col items-end gap-0 mt-auto w-full">
                    {dailyIncome[item.date] > 0 && (
                      <span className="text-[9px] md:text-[10px] text-emerald-600 font-medium leading-tight truncate max-w-full">
                        +{dailyIncome[item.date] >= 1000 ? `${(dailyIncome[item.date] / 1000).toFixed(1)}k` : dailyIncome[item.date].toFixed(0)}
                      </span>
                    )}
                    {dailyExpense[item.date] > 0 && (
                      <span className="text-[9px] md:text-[10px] text-red-500 font-medium leading-tight truncate max-w-full">
                        -{dailyExpense[item.date] >= 1000 ? `${(dailyExpense[item.date] / 1000).toFixed(1)}k` : dailyExpense[item.date].toFixed(0)}
                      </span>
                    )}
                  </div>
                )}

                {/* Activity dot on mobile */}
                {(dailyCountIncome[item.date] > 0 || dailyCountExpense[item.date] > 0) && (
                  <div className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dailyCountIncome[item.date] > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {dailyCountExpense[item.date] > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="hidden sm:block">
              <CalendarDayTooltip
                date={item.date}
                income={Number(dailyIncome[item.date] || 0)}
                expense={Number(dailyExpense[item.date] || 0)}
                countIncome={dailyCountIncome[item.date] || 0}
                countExpense={dailyCountExpense[item.date] || 0}
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div key={idx} className="bg-card min-h-[44px] sm:min-h-[56px] md:min-h-[64px]" />
      ))}
    </div>
  );
}
