/**
 * Utility functions for reading and writing URL query parameters. These helpers
 * are designed for use in client-side code only. On the server, they are no-ops.
 */

/**
 * Retrieves a query parameter value from the current URL. Returns null on the server or if not found.
 */
export function getQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Sets or removes a query parameter in the current URL without reloading the page. Passing
 * `null` as the value removes the parameter.
 */
export function setQueryParam(name: string, value: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null || value === undefined || value === '') {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.replaceState({}, '', url.toString());
}

/**
 * Parses all query parameters into a plain object. Useful for initializing filter state.
 */
export function getAllQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params: Record<string, string> = {};
  const search = new URLSearchParams(window.location.search);
  search.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}