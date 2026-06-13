import { startOfMonth, endOfMonth, format, eachDayOfInterval, isSameMonth } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

export function today(): string {
  return format(new Date(), DATE_FORMAT);
}

export function monthRange(date: Date = new Date()): { start: string; end: string } {
  return {
    start: format(startOfMonth(date), DATE_FORMAT),
    end: format(endOfMonth(date), DATE_FORMAT),
  };
}

export function daysInMonth(date: Date = new Date()): string[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end }).map((d) => format(d, DATE_FORMAT));
}

export function isDateInMonth(dateStr: string, monthStr: string): boolean {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(dateStr);
  return isSameMonth(date, new Date(year, month - 1, 1));
}
