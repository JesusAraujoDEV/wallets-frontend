import type { Dayjs } from "dayjs";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentMonth: Dayjs;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
}

export function CalendarHeader({ currentMonth, onPrev, onToday, onNext }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
      <h3 className="text-xl font-semibold w-full sm:w-auto">Calendario</h3>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <div className="text-sm font-medium w-36 text-center">{currentMonth.format('MMMM YYYY')}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={onToday}>Hoy</Button>
          <Button variant="outline" size="sm" onClick={onNext}>Siguiente</Button>
        </div>
      </div>
    </div>
  );
}
