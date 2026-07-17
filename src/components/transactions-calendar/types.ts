export type CalendarMode = 'income' | 'expense' | 'balance';
export type CalendarScope = 'all' | 'stats';

export interface CalendarDay {
  date: string;
  totalUsd: number;
  income: number;
  expense: number;
}
