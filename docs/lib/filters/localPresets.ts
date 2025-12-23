/**
 * Functions to store and retrieve filter presets in localStorage. Each preset is
 * stored under a namespace key derived from the dashboard or module. Values
 * are serialized as JSON.
 */

const PREFIX = 'ugc_dashboard_presets_';

export function savePreset(namespace: string, name: string, values: Record<string, any>) {
  if (typeof window === 'undefined') return;
  const key = PREFIX + namespace;
  const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
  stored[name] = values;
  localStorage.setItem(key, JSON.stringify(stored));
}

export function getPresets(namespace: string): Record<string, Record<string, any>> {
  if (typeof window === 'undefined') return {};
  const key = PREFIX + namespace;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

export function deletePreset(namespace: string, name: string) {
  if (typeof window === 'undefined') return;
  const key = PREFIX + namespace;
  const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
  delete stored[name];
  localStorage.setItem(key, JSON.stringify(stored));
}