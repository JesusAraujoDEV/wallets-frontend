import dayjs from "dayjs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDayTooltip } from "./CalendarDayTooltip";
import type { CalendarDay } from "./types";

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-7 gap-1 sm:gap-2">
      {WEEKDAY_LABELS.map((w, i) => (
        <div key={i} className="text-[10px] sm:text-xs text-muted-foreground text-center">{w}</div>
      ))}
      {days.map((item, idx) => item ? (
        <TooltipProvider key={idx}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className={`w-full h-8 sm:h-10 rounded-md border ${selectedDate === item.date ? 'ring-2 ring-primary/60' : ''}`}
                style={{ backgroundColor: colorFor(item), borderColor: 'hsl(var(--border))' }}
                onClick={() => onSelectDate(item.date)}
                title={item.date}
              >
                <div className="text-[10px] sm:text-xs text-foreground/80 px-1 pt-0.5 text-right">{dayjs(item.date).date()}</div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
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
        <div key={idx} />
      ))}
    </div>
  );
}
