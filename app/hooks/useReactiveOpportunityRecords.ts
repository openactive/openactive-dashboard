"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALL_FILTER,
  type ExplorerFilters,
} from "../lib/explore-filters";
import { buildLocationFilterQuery } from "../lib/explorer-location-query";
import {
  DEFAULT_RECORDS_LIMIT,
  getOpportunityRecords,
} from "../services/opportunity-records";
import type {
  OpportunityRecord,
  OpportunityRecordsQuery,
} from "../types/opportunity-records";

type CodeMaps = {
  districtCodeByName: Map<string, string>;
  countryCodeById: Map<string, string>;
  regionCodeByScope: Map<string, string>;
};

type Params = {
  filters: ExplorerFilters;
  maps: CodeMaps;
  /** Records per page; defaults to the API's standard 20. */
  limit?: number;
  /** Skip fetching until enabled — useful for lazy section mount. */
  enabled?: boolean;
};

type Result = {
  items: OpportunityRecord[];
  /** True for the very first request OR when the filter set changes. */
  isLoading: boolean;
  /** True only while a "Load more" request is in flight. */
  isLoadingMore: boolean;
  hasMore: boolean;
  /** Total if the API supplied one; otherwise undefined. */
  total: number | undefined;
  /** User-facing error string. Null when no error. */
  error: string | null;
  /** Polite SR announcement, e.g. "Loaded 20 records". */
  status: string;
  loadMore: () => void;
  retry: () => void;
};

type CacheEntry = {
  items: OpportunityRecord[];
  hasMore: boolean;
  total: number | undefined;
  /** Highest offset successfully loaded so we can resume on retry. */
  loadedThrough: number;
};

const ERROR_MESSAGE =
  "We couldn't load records right now. Please try again.";

/** Build the wire query from filters; offset/limit are added per request. */
function buildBaseQuery(
  filters: ExplorerFilters,
  maps: CodeMaps
): Omit<OpportunityRecordsQuery, "offset" | "limit"> {
  const locationQuery = buildLocationFilterQuery(filters, maps);
  return {
    ...locationQuery,
    ...(filters.publisher !== ALL_FILTER
      ? { publisher: filters.publisher }
      : {}),
    ...(filters.activity !== ALL_FILTER
      ? { activity: filters.activity }
      : {}),
  };
}

/**
 * Paginated fetch of /opportunity-records driven by the explorer filters.
 *
 * - Caches per filter combination so flipping back to a previous selection
 *   is instant and preserves any pages already loaded.
 * - Keeps the previous list visible during refetch so users don't see a
 *   flash of empty content while filters change.
 * - Surfaces a status string the consumer can announce via aria-live so
 *   screen reader users know when records have arrived.
 */
export function useReactiveOpportunityRecords({
  filters,
  maps,
  limit = DEFAULT_RECORDS_LIMIT,
  enabled = true,
}: Params): Result {
  const baseQuery = buildBaseQuery(filters, maps);
  const cacheKey = JSON.stringify(baseQuery);

  const [items, setItems] = useState<OpportunityRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  // Track the active query so late responses from a previous filter set
  // don't overwrite the current view.
  const activeKeyRef = useRef<string>(cacheKey);

  const fetchPage = useCallback(
    async (key: string, query: OpportunityRecordsQuery, mode: "initial" | "more") => {
      activeKeyRef.current = key;
      if (mode === "initial") setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const response = await getOpportunityRecords(query);
        if (activeKeyRef.current !== key) return;

        const nextItems =
          mode === "initial"
            ? response.items
            : [...(cacheRef.current.get(key)?.items ?? []), ...response.items];
        const offset = query.offset ?? 0;
        const loadedThrough = offset + response.items.length;

        const entry: CacheEntry = {
          items: nextItems,
          hasMore: response.has_more,
          total: response.total,
          loadedThrough,
        };
        cacheRef.current.set(key, entry);

        setItems(nextItems);
        setHasMore(response.has_more);
        setTotal(response.total);
      } catch {
        if (activeKeyRef.current !== key) return;
        setError(ERROR_MESSAGE);
      } finally {
        if (activeKeyRef.current === key) {
          if (mode === "initial") setIsLoading(false);
          else setIsLoadingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      activeKeyRef.current = cacheKey;
      setItems(cached.items);
      setHasMore(cached.hasMore);
      setTotal(cached.total);
      setIsLoading(false);
      setError(null);
      return;
    }

    fetchPage(
      cacheKey,
      { ...baseQuery, offset: 0, limit },
      "initial"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers baseQuery
  }, [cacheKey, enabled, limit]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore || error) return;
    const cached = cacheRef.current.get(cacheKey);
    const nextOffset = cached?.loadedThrough ?? items.length;
    fetchPage(
      cacheKey,
      { ...baseQuery, offset: nextOffset, limit },
      "more"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers baseQuery
  }, [cacheKey, error, fetchPage, hasMore, isLoading, isLoadingMore, items.length, limit]);

  const retry = useCallback(() => {
    cacheRef.current.delete(cacheKey);
    fetchPage(cacheKey, { ...baseQuery, offset: 0, limit }, "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers baseQuery
  }, [cacheKey, fetchPage, limit]);

  const status = buildStatus({
    isLoading,
    isLoadingMore,
    error,
    count: items.length,
    total,
  });

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    total,
    error,
    status,
    loadMore,
    retry,
  };
}

/** Polite SR announcement reflecting the current load state. */
function buildStatus(args: {
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  count: number;
  total: number | undefined;
}): string {
  if (args.error) return args.error;
  if (args.isLoading) return "Loading records";
  if (args.isLoadingMore) return "Loading more records";
  if (args.count === 0) return "No records to show";
  const totalSuffix = args.total ? ` of ${args.total}` : "";
  return `Loaded ${args.count}${totalSuffix} records`;
}
