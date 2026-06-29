import { useEffect, useRef, useState } from "react";
import {
  ALL_FILTER,
  FILTER_EMPTY_VALUE,
  FILTER_LOADING_VALUE,
  type ExplorerFilterOption,
} from "../lib/explore-filters";
import type { ExplorerFilters } from "../lib/explore-filters";
import {
  buildLocationFilterQuery,
  getLocationEmptyMessage,
  type LocationScopedItem,
} from "../lib/explorer-location-query";
import type { GeoHierarchy } from "../lib/geo-hierarchy";

type LocationQuery = ReturnType<typeof buildLocationFilterQuery>;

type UseLocationScopedFilterOptionsParams = {
  item: LocationScopedItem;
  allLabel: string;
  loadingLabel: string;
  hierarchy: GeoHierarchy;
  filters: Pick<ExplorerFilters, "areas">;
  enabled?: boolean;
  fetchNames: (
    query: LocationQuery & {
      publisher?: string[];
      organization?: string[];
      activity?: string[];
    }
  ) => Promise<string[]>;
  publisher?: string[];
  organization?: string[];
  activity?: string[];
};

type FetchResult = {
  options: ExplorerFilterOption[];
};

export function useLocationScopedFilterOptions({
  item,
  allLabel,
  loadingLabel,
  hierarchy,
  filters,
  enabled = true,
  fetchNames,
  publisher,
  organization,
  activity,
}: UseLocationScopedFilterOptionsParams) {
  const [options, setOptions] = useState<ExplorerFilterOption[]>([
    { value: ALL_FILTER, label: allLabel },
  ]);
  // Stores in-flight Promises. Resolved promises stay in the map for cheap re-use.
  const cacheRef = useRef<Map<string, Promise<FetchResult>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const query = {
      ...buildLocationFilterQuery(filters, hierarchy),
      ...(publisher && publisher.length > 0 ? { publisher } : {}),
      ...(organization && organization.length > 0 ? { organization } : {}),
      ...(activity && activity.length > 0 ? { activity } : {}),
    };
    const cacheKey = JSON.stringify({ query, item });

    let promise = cacheRef.current.get(cacheKey);

    if (!promise) {
      // DEV-ONLY perf baseline (remove after): counts real option-list fetches.
      if (process.env.NODE_ENV !== "production")
        console.count(`[fetch] ${item}`);
      setOptions((prev) => {
        const withoutMessages = prev.filter(
          (o) =>
            o.value !== FILTER_LOADING_VALUE &&
            o.value !== FILTER_EMPTY_VALUE
        );
        const hasAll = withoutMessages.some((o) => o.value === ALL_FILTER);
        const base = hasAll
          ? withoutMessages
          : [{ value: ALL_FILTER, label: allLabel }, ...withoutMessages];

        return [
          base[0],
          { value: FILTER_LOADING_VALUE, label: loadingLabel },
          ...base.slice(1),
        ];
      });

      promise = fetchNames(query)
        .then((names) => {
          const nextOptions: ExplorerFilterOption[] =
            names.length === 0
              ? [
                  {
                    value: FILTER_EMPTY_VALUE,
                    label: getLocationEmptyMessage(filters, hierarchy, item),
                  },
                ]
              : [
                  { value: ALL_FILTER, label: allLabel },
                  ...names.map((name) => ({ value: name, label: name })),
                ];
          return { options: nextOptions };
        })
        .catch((err) => {
          cacheRef.current.delete(cacheKey);
          throw err;
        });
      cacheRef.current.set(cacheKey, promise);
    }

    let cancelled = false;
    promise
      .then((result) => {
        if (cancelled) return;
        setOptions(result.options);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([{ value: ALL_FILTER, label: allLabel }]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    filters.areas,
    hierarchy,
    item,
    allLabel,
    loadingLabel,
    fetchNames,
    publisher,
    organization,
    activity,
  ]);

  return options;
}
