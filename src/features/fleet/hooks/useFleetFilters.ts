import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEVICE_CATEGORY_ORDER } from '../../../constants/deviceCategory';
import { DEVICE_STATUS_ORDER } from '../../../constants/deviceStatus';
import type { DeviceStatus, DeviceType } from '../../../types/device';
import { DEVICE_TYPE_ORDER } from '../../../constants/deviceType';
import type { FleetCategoryFilter, FleetFilters } from '../types/fleetFilters';

/** Query-string keys. `lease=due` and `status=…` are also linked to from the dashboard. */
const PARAM = {
  category: 'category',
  status: 'status',
  type: 'type',
  lease: 'lease',
  query: 'q',
} as const;

function parseOption<T extends string>(value: string | null, allowed: readonly T[]): T | 'all' {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : 'all';
}

export function useFleetFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FleetFilters>(
    () => ({
      category: parseOption(searchParams.get(PARAM.category), DEVICE_CATEGORY_ORDER),
      status: parseOption(searchParams.get(PARAM.status), DEVICE_STATUS_ORDER),
      type: parseOption(searchParams.get(PARAM.type), DEVICE_TYPE_ORDER),
      leaseDue: searchParams.get(PARAM.lease) === 'due',
      query: searchParams.get(PARAM.query) ?? '',
    }),
    [searchParams],
  );

  /** Sets or removes (null / empty string) query params without adding history entries. */
  const updateParams = useCallback(
    (updates: Partial<Record<keyof typeof PARAM, string | null>>) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [field, value] of Object.entries(updates)) {
            const key = PARAM[field as keyof typeof PARAM];
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setCategory = useCallback(
    // A type filter from another category would hide everything, so it resets with the tab.
    (category: FleetCategoryFilter) => updateParams({ category: category === 'all' ? null : category, type: null }),
    [updateParams],
  );

  const setStatus = useCallback(
    (status: DeviceStatus | 'all') => updateParams({ status: status === 'all' ? null : status }),
    [updateParams],
  );

  const setType = useCallback(
    (type: DeviceType | 'all') => updateParams({ type: type === 'all' ? null : type }),
    [updateParams],
  );

  const setLeaseDue = useCallback((leaseDue: boolean) => updateParams({ lease: leaseDue ? 'due' : null }), [updateParams]);

  const setQuery = useCallback((query: string) => updateParams({ query }), [updateParams]);

  /** Clears everything except the category tab. */
  const clearFilters = useCallback(
    () => updateParams({ status: null, type: null, lease: null, query: null }),
    [updateParams],
  );

  const hasActiveFilters =
    filters.status !== 'all' || filters.type !== 'all' || filters.leaseDue || filters.query.trim() !== '';

  return { filters, setCategory, setStatus, setType, setLeaseDue, setQuery, clearFilters, hasActiveFilters };
}
