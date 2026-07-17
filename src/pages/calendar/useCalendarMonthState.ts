import { useEffect, useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, format, getDay, isSameDay, startOfMonth } from "date-fns";

export function useCalendarMonthState() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

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

  useEffect(() => {
    const hasSelection = days.some((day) => format(day, "yyyy-MM-dd") === selectedDate);
    if (!hasSelection && days.length > 0) {
      const today = days.find((day) => isSameDay(day, new Date()));
      setSelectedDate(format(today ?? days[0], "yyyy-MM-dd"));
    }
  }, [days, selectedDate]);

  return { currentMonth, setCurrentMonth, selectedDate, setSelectedDate, days, startOffset };
}
