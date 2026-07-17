import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { Card } from "@/components/ui/card";
import type { CalendarMode, CalendarScope } from "./types";
import { useCalendarBaseData } from "./useCalendarBaseData";
import { useCalendarMonthNavigation } from "./useCalendarMonthNavigation";
import { useCalendarTransactions } from "./useCalendarTransactions";
import { useDailyTotals } from "./useDailyTotals";
import { useCalendarGrid } from "./useCalendarGrid";
import { useSelectedDayTransactions } from "./useSelectedDayTransactions";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarModeScopeTabs } from "./CalendarModeScopeTabs";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarStatusMessages } from "./CalendarStatusMessages";
import { SelectedDayTransactions } from "./SelectedDayTransactions";

export function TransactionsCalendar({ selectedAccount }: { selectedAccount?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories, fallbackLocalTx } = useCalendarBaseData();
  const { currentMonth, setCurrentMonth, selectedDate, setSelectedDate, monthStart } =
    useCalendarMonthNavigation(searchParams.get('calendarDate'));

  const [mode, setModeState] = useState<CalendarMode>(() => {
    const m = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('calendarMode') : null);
    return (m === 'income' || m === 'expense' || m === 'balance') ? m : 'expense';
  });
  const [scope, setScopeState] = useState<CalendarScope>(() => {
    const s = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('calendarScope') : null);
    return (s === 'all' || s === 'stats') ? s : 'all';
  });

  const { transactions, loading, error } = useCalendarTransactions({ currentMonth, selectedAccount, scope, fallbackLocalTx });
  const monthTx = useMemo(() => transactions, [transactions]);
  const { dailyIncome, dailyExpense, dailyCountIncome, dailyCountExpense } = useDailyTotals(monthTx, categories);
  const { days, dailyTotals, colorFor } = useCalendarGrid({ monthStart, mode, dailyIncome, dailyExpense });
  const selectedDayTx = useSelectedDayTransactions(selectedDate, monthTx, mode);

  const pushCalendarParams = (overrides: { mode?: CalendarMode; scope?: CalendarScope; date?: string }) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', 'transactions');
    next.set('transactionsView', 'calendar');
    next.set('calendarMode', overrides.mode ?? mode);
    next.set('calendarScope', overrides.scope ?? scope);
    const date = overrides.date ?? selectedDate;
    if (date) next.set('calendarDate', date);
    setSearchParams(next, { replace: false });
  };

  const handleModeChange = (v: CalendarMode) => { setModeState(v); pushCalendarParams({ mode: v }); };
  const handleScopeChange = (v: CalendarScope) => { setScopeState(v); pushCalendarParams({ scope: v }); };
  const handleSelectDate = (date: string) => { setSelectedDate(date); pushCalendarParams({ date }); };

  return (
    <Card className="p-4 md:p-6">
      <CalendarHeader
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth(m => m.subtract(1, 'month'))}
        onToday={() => setCurrentMonth(dayjs())}
        onNext={() => setCurrentMonth(m => m.add(1, 'month'))}
      />
      <CalendarModeScopeTabs mode={mode} scope={scope} onModeChange={handleModeChange} onScopeChange={handleScopeChange} />
      <CalendarGrid
        days={days}
        selectedDate={selectedDate}
        colorFor={colorFor}
        dailyIncome={dailyIncome}
        dailyExpense={dailyExpense}
        dailyCountIncome={dailyCountIncome}
        dailyCountExpense={dailyCountExpense}
        onSelectDate={handleSelectDate}
      />
      <CalendarStatusMessages loading={loading} error={error} isEmpty={transactions.length === 0} />
      {selectedDate ? (
        <SelectedDayTransactions
          selectedDate={selectedDate}
          total={Number(dailyTotals[selectedDate] || 0)}
          transactions={selectedDayTx}
        />
      ) : null}
    </Card>
  );
}
