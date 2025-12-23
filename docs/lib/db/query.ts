import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Helper to apply date range filters to a Supabase query. Returns the modified query.
 *
 * @param query The Supabase query
 * @param from ISO string representing the start date (inclusive)
 * @param to ISO string representing the end date (inclusive)
 * @param column The column name to filter on (defaults to `created_at`)
 */
export function applyDateRangeFilter<T>(
  query: any,
  from: string | null,
  to: string | null,
  column = 'created_at'
) {
  if (from) {
    query = query.gte(column, from);
  }
  if (to) {
    query = query.lte(column, to);
  }
  return query;
}

/**
 * Helper to apply pagination to a Supabase query. Returns the modified query.
 *
 * @param query The Supabase query
 * @param page The page number (1-indexed)
 * @param pageSize Number of records per page
 */
export function applyPagination<T>(query: any, page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
}