"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { groupFeedsByDataset, type FeedQualityGroup } from "../lib/feed-quality";
import { getFeedQuality } from "../services/feed-quality";
import type { FilterQuery } from "../services/filter-params";
import type { FeedQualityRow } from "../types/feed-quality";

type FeedQualityResult = {
  rows: FeedQualityRow[];
  groups: FeedQualityGroup[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
};

// Stable, order-independent cache key for a filter combination.
function queryKey(query: FilterQuery): string {
  return JSON.stringify([
    query.country ?? [],
    query.region ?? [],
    query.district ?? [],
    query.nhs_trust ?? [],
    query.publisher ?? [],
    query.organization ?? [],
    query.activity ?? [],
  ]);
}

// Stable default so an omitted query doesn't re-run the effect every render.
const EMPTY_QUERY: FilterQuery = {};

/**
 * Fetch the per-feed quality rows, refetching when the filter query changes.
 * Pass a stable (memoized) query — it's used as an effect dependency. Resolved
 * rows are cached per filter-combination so returning to a previous filter set
 * doesn't refetch. `enabled` keeps the whole thing lazy until the caller opts in.
 */
export function useFeedQuality(
  enabled: boolean = true,
  query: FilterQuery = EMPTY_QUERY
): FeedQualityResult {
  const [rows, setRows] = useState<FeedQualityRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const cacheRef = useRef<Map<string, Promise<FeedQualityRow[]>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const key = queryKey(query);
    let promise = cacheRef.current.get(key);
    const isCached = Boolean(promise);
    if (!promise) {
      promise = getFeedQuality(query);
      cacheRef.current.set(key, promise);
    }

    let cancelled = false;
    setError(null);
    // Only show the loading state for a fresh combination; a cached result
    // swaps in without flashing the skeleton.
    if (!isCached) setIsLoading(true);

    promise
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // Drop the failed combination so it can be retried.
        cacheRef.current.delete(key);
        setError(err instanceof Error ? err.message : "Failed to load feed quality.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, query, reloadKey]);

  const groups = useMemo(() => groupFeedsByDataset(rows), [rows]);

  const retry = useCallback(() => {
    cacheRef.current.delete(queryKey(query));
    setReloadKey((k) => k + 1);
  }, [query]);

  return { rows, groups, isLoading, error, retry };
}
