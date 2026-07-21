import type { Dayjs } from "dayjs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: Dayjs;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
}

export function CalendarHeader({ currentMonth, onPrev, onToday, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h3 className="text-lg sm:text-xl font-bold capitalize">
          {currentMonth.format('MMMM YYYY')}
        </h3>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev} aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-medium" onClick={onToday}>
          Hoy
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext} aria-label="Mes siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
