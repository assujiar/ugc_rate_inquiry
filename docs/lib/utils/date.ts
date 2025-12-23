import { format, parseISO, differenceInDays, isValid } from 'date-fns';

/**
 * Formats a date or ISO string into the given pattern (default yyyy-MM-dd).
 */
export function formatDate(date: Date | string | null | undefined, pattern = 'yyyy-MM-dd'): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, pattern);
}

/**
 * Calculates the difference in days between two dates. If invalid, returns 0.
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const s = typeof start === 'string' ? parseISO(start) : start;
  const e = typeof end === 'string' ? parseISO(end) : end;
  if (!isValid(s) || !isValid(e)) return 0;
  return differenceInDays(e, s);
}