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

type CodeMaps = {
  districtCodeByName: Map<string, string>;
  countryCodeById: Map<string, string>;
  regionCodeByScope: Map<string, string>;
};

type LocationQuery = ReturnType<typeof buildLocationFilterQuery>;

type UseLocationScopedFilterOptionsParams = {
  item: LocationScopedItem;
  allLabel: string;
  loadingLabel: string;
  hierarchy: GeoHierarchy;
  filters: Pick<ExplorerFilters, "district" | "areaScope">;
  maps: CodeMaps;
  fetchNames: (query: LocationQuery & { publisher?: string }) => Promise<string[]>;
  onFetched?: (names: string[]) => void;
  /** Restrict results to a single publisher (ignored when ALL_FILTER). */
  publisher?: string;
};

export function useLocationScopedFilterOptions({
  item,
  allLabel,
  loadingLabel,
  hierarchy,
  filters,
  maps,
  fetchNames,
  onFetched,
  publisher,
}: UseLocationScopedFilterOptionsParams) {
  const [options, setOptions] = useState<ExplorerFilterOption[]>([
    { value: ALL_FILTER, label: allLabel },
  ]);
  const cacheRef = useRef<Map<string, ExplorerFilterOption[]>>(new Map());
  const onFetchedRef = useRef(onFetched);
  onFetchedRef.current = onFetched;

  useEffect(() => {
    let cancelled = false;
    const query = {
      ...buildLocationFilterQuery(filters, maps),
      ...(publisher && publisher !== ALL_FILTER ? { publisher } : {}),
    };
    const cacheKey = JSON.stringify({ query, item });
    const cached = cacheRef.current.get(cacheKey);

    if (cached) {
      setOptions(cached);
      return;
    }

    setOptions([
      { value: ALL_FILTER, label: allLabel },
      { value: FILTER_LOADING_VALUE, label: loadingLabel },
    ]);

    fetchNames(query)
      .then((names) => {
        if (cancelled) return;

        const next: ExplorerFilterOption[] =
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

        cacheRef.current.set(cacheKey, next);
        setOptions(next);
        onFetchedRef.current?.(names);
      })
      .catch(() => {
        if (cancelled) return;
        setOptions([{ value: ALL_FILTER, label: allLabel }]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    filters.district,
    filters.areaScope,
    hierarchy,
    item,
    maps,
    allLabel,
    loadingLabel,
    fetchNames,
    publisher,
  ]);

  return options;
}
