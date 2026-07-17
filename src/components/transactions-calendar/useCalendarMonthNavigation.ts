import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

// Owns the current month + selected day, seeded once from the ?calendarDate URL param.
export function useCalendarMonthNavigation(initialDateParam: string | null) {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!initialDateParam) return;
    setSelectedDate(initialDateParam);
    const d = dayjs(initialDateParam);
    if (d.isValid()) setCurrentMonth(d);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthStart = useMemo(() => currentMonth.startOf('month'), [currentMonth]);
  const monthEnd = useMemo(() => currentMonth.endOf('month'), [currentMonth]);
  const monthKey = useMemo(() => currentMonth.format('YYYY-MM'), [currentMonth]);

  return { currentMonth, setCurrentMonth, selectedDate, setSelectedDate, monthStart, monthEnd, monthKey };
}
