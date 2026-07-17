import dayjs from "dayjs";

interface CalendarDayTooltipProps {
  date: string;
  income: number;
  expense: number;
  countIncome: number;
  countExpense: number;
}

export function CalendarDayTooltip({ date, income, expense, countIncome, countExpense }: CalendarDayTooltipProps) {
  const balance = income - expense;
  return (
    <div className="min-w-0 max-w-xs space-y-1">
      <div className="text-xs font-semibold">{dayjs(date).format('ddd, MMM D')}</div>
      <div className="text-xs flex justify-between"><span>Ingresos:</span><span className="font-medium">${income.toFixed(2)} <span className="text-muted-foreground">({countIncome})</span></span></div>
      <div className="text-xs flex justify-between"><span>Gastos:</span><span className="font-medium">${expense.toFixed(2)} <span className="text-muted-foreground">({countExpense})</span></span></div>
      <div className="text-xs flex justify-between"><span>Balance:</span><span className="font-medium">${balance.toFixed(2)}</span></div>
    </div>
  );
}
