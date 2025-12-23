/**
 * Simple logging utilities. Only logs to the console in non-production
 * environments. Extend or replace this with a dedicated logging service as
 * needed.
 */

export function log(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function warn(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

export function error(...args: any[]) {
  // Always log errors
  // eslint-disable-next-line no-console
  console.error(...args);
}