import { useEffect, useState } from 'react';
import { getAllQueryParams, setQueryParam } from '@/lib/filters/urlState';
import { savePreset, getPresets, deletePreset } from '@/lib/filters/localPresets';

export interface FilterState {
  [key: string]: string;
}

interface UseFilterStateOptions {
  /**
   * Namespace for storing presets in localStorage. Typically the dashboard or module name.
   */
  namespace: string;
  /**
   * Default values for filters when no query parameters are present.
   */
  defaults?: FilterState;
}

/**
 * A hook to manage filter state synchronized with URL query parameters and
 * localStorage presets. Returns the current state, a setter function, and
 * methods to save/delete presets.
 */
export function useFilterState(options: UseFilterStateOptions) {
  const { namespace, defaults = {} } = options;
  const [state, setState] = useState<FilterState>(() => {
    if (typeof window === 'undefined') {
      return { ...defaults };
    }
    const params = getAllQueryParams();
    return { ...defaults, ...params };
  });

  useEffect(() => {
    // When state changes, update URL parameters
    Object.entries(state).forEach(([key, value]) => {
      setQueryParam(key, value);
    });
  }, [state]);

  function updateFilter(key: string, value: string) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function saveCurrentPreset(name: string) {
    savePreset(namespace, name, state);
  }

  function deletePresetByName(name: string) {
    deletePreset(namespace, name);
  }

  function loadPreset(name: string) {
    const presets = getPresets(namespace);
    const preset = presets[name];
    if (preset) {
      setState({ ...state, ...preset });
    }
  }

  return {
    state,
    updateFilter,
    saveCurrentPreset,
    deletePreset: deletePresetByName,
    loadPreset,
    presets: typeof window === 'undefined' ? {} : getPresets(namespace)
  };
}