"use client";

import { useEffect, useRef, useState } from "react";
import type { ExplorerFilters } from "../lib/explore-filters";
import { buildLocationFilterQuery } from "../lib/explorer-location-query";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import {
  EMPTY_PRESENT_NAMES,
  EMPTY_SUMMARY,
  reduceOpportunities,
  type PresentNames,
  type ReducedOpportunities,
} from "../lib/opportunity-reduce";
import { getOpportunities } from "../services/opportunities";
import type { OpportunitiesQuery } from "../types/opportunities";

export type { PresentNames };

type Params = {
  filters: ExplorerFilters;
  hierarchy: GeoHierarchy;
  onResolved?: (presentNames: PresentNames) => void;
};

type Result = {
  summary: ReducedOpportunities["summary"];
  districtCounts: ReducedOpportunities["districtCounts"];
  isLoading: boolean;
};

/**
 * Fetch /opportunities for the current filters and reduce the response
 * into the shapes the summary card and choropleth need.
 *
 * Caches per-query and keeps the previous result visible during refetch
 * so the UI doesn't flash zeros while a new request is in flight.
 */
export function useReactiveOpportunities({
  filters,
  hierarchy,
  onResolved,
}: Params): Result {
  const [data, setData] = useState<Omit<Result, "isLoading">>({
    summary: EMPTY_SUMMARY,
    districtCounts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const cacheRef = useRef<Map<string, Promise<ReducedOpportunities>>>(new Map());
  const onResolvedRef = useRef(onResolved);
  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  const locationQuery = buildLocationFilterQuery(filters, hierarchy);
  const query: OpportunitiesQuery = {
    ...locationQuery,
    ...(filters.publisher.length > 0 ? { publisher: filters.publisher } : {}),
    ...(filters.organization.length > 0 ? { organization: filters.organization } : {}),
    ...(filters.activity.length > 0 ? { activity: filters.activity } : {}),
  };
  // boundaryType is part of the key because NHS-with-no-trust and
  // LAD-with-no-area produce the same query but need different choropleth keys.
  const cacheKey = JSON.stringify({ query, boundaryType: filters.boundaryType });

  useEffect(() => {
    let promise = cacheRef.current.get(cacheKey);
    if (!promise) {
      setIsLoading(true);
      promise = getOpportunities(query)
        .then((rows) =>
          rows.length === 0
            ? {
                summary: { ...EMPTY_SUMMARY, boundaryType: filters.boundaryType },
                districtCounts: [],
                presentNames: EMPTY_PRESENT_NAMES,
              }
            : reduceOpportunities(rows, filters.boundaryType)
        )
        .catch((err) => {
          cacheRef.current.delete(cacheKey);
          throw err;
        });
      cacheRef.current.set(cacheKey, promise);
    }

    let cancelled = false;
    promise
      .then((next) => {
        if (cancelled) return;
        setData({ summary: next.summary, districtCounts: next.districtCounts });
        setIsLoading(false);
        onResolvedRef.current?.(next.presentNames);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep previous data on error rather than zeroing the card.
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers query + boundaryType
  }, [cacheKey]);

  return { ...data, isLoading };
}
