"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALL_FILTER,
  EXPLORER_TOP_LIMIT,
  type DistrictCount,
  type ExplorerFilters,
  type ExplorerSummary,
  type RankedItem,
} from "../lib/explore-filters";
import { buildLocationFilterQuery } from "../lib/explorer-location-query";
import { getOpportunities } from "../services/opportunities";
import type {
  Opportunity,
  OpportunitiesQuery,
} from "../types/opportunities";

type CodeMaps = {
  districtCodeByName: Map<string, string>;
  countryCodeById: Map<string, string>;
  regionCodeByScope: Map<string, string>;
};

type Params = {
  filters: ExplorerFilters;
  maps: CodeMaps;
};

type Result = {
  summary: ExplorerSummary;
  districtCounts: DistrictCount[];
  isLoading: boolean;
};

const EMPTY_SUMMARY: ExplorerSummary = {
  totalOpportunities: 0,
  areaCount: 0,
  publisherCount: 0,
  providerCount: 0,
  activityCount: 0,
  activityOpportunities: 0,
  facilityOpportunities: 0,
  topAreas: [],
  topPublishers: [],
  topProviders: [],
  topActivities: [],
};

/** Sort a name→count map descending and keep the top N entries. */
function rankTop(map: Map<string, number>, limit: number): RankedItem[] {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Reduce raw /opportunities rows into:
 *  - a summary (totals + unique counts + top-N breakdowns) for the panel
 *  - per-district totals for the choropleth, keyed by district_name
 *    so it joins directly with the geojson the map already uses.
 */
function reduce(rows: Opportunity[]): {
  summary: ExplorerSummary;
  districtCounts: DistrictCount[];
} {
  const countByDistrict = new Map<string, number>();
  const countByPublisher = new Map<string, number>();
  const countByProvider = new Map<string, number>();
  const countByActivity = new Map<string, number>();
  let totalOpportunities = 0;
  let activityOpportunities = 0;
  let facilityOpportunities = 0;

  const bump = (m: Map<string, number>, key: string, n: number) =>
    m.set(key, (m.get(key) ?? 0) + n);

  for (const row of rows) {
    const n = row.opportunity_count;
    totalOpportunities += n;
    if (row.is_activity) activityOpportunities += n;
    else facilityOpportunities += n;

    if (row.district_name) bump(countByDistrict, row.district_name, n);
    if (row.publisher) bump(countByPublisher, row.publisher, n);
    if (row.provider) bump(countByProvider, row.provider, n);

    // activity_or_facility is a JSON-encoded string array; parse defensively.
    // Each name in the array shares this row's opportunity_count — typical
    // rows have a single entry, but we handle multi-tag rows safely.
    if (row.activity_or_facility) {
      try {
        const parsed: unknown = JSON.parse(row.activity_or_facility);
        if (Array.isArray(parsed)) {
          for (const v of parsed) {
            if (typeof v === "string" && v.trim()) {
              bump(countByActivity, v, n);
            }
          }
        }
      } catch {
        // Ignore malformed entries — count nothing rather than crash.
      }
    }
  }

  const districtCounts: DistrictCount[] = [...countByDistrict.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalOpportunities,
      areaCount: countByDistrict.size,
      publisherCount: countByPublisher.size,
      providerCount: countByProvider.size,
      activityCount: countByActivity.size,
      activityOpportunities,
      facilityOpportunities,
      topAreas: rankTop(countByDistrict, EXPLORER_TOP_LIMIT),
      topPublishers: rankTop(countByPublisher, EXPLORER_TOP_LIMIT),
      topProviders: rankTop(countByProvider, EXPLORER_TOP_LIMIT),
      topActivities: rankTop(countByActivity, EXPLORER_TOP_LIMIT),
    },
    districtCounts,
  };
}

/**
 * Fetch /opportunities for the current filters and reduce the response
 * into the shapes the summary card and choropleth need.
 *
 * Caches per-query and keeps the previous result visible during refetch
 * so the UI doesn't flash zeros while a new request is in flight.
 */
export function useReactiveOpportunities({
  filters,
  maps,
}: Params): Result {
  const [data, setData] = useState<Omit<Result, "isLoading">>({
    summary: EMPTY_SUMMARY,
    districtCounts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef<Map<string, Omit<Result, "isLoading">>>(new Map());

  const locationQuery = buildLocationFilterQuery(filters, maps);
  const query: OpportunitiesQuery = {
    ...locationQuery,
    ...(filters.publisher !== ALL_FILTER ? { publisher: filters.publisher } : {}),
    ...(filters.activity.length > 0 ? { activity: filters.activity[0] } : {}),
  };
  const cacheKey = JSON.stringify(query);

  useEffect(() => {
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getOpportunities(query)
      .then((rows) => {
        if (cancelled) return;
        const next =
          rows.length === 0
            ? { summary: EMPTY_SUMMARY, districtCounts: [] }
            : reduce(rows);
        cacheRef.current.set(cacheKey, next);
        setData(next);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Keep previous data on error rather than zeroing the card.
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cacheKey covers query
  }, [cacheKey]);

  return { ...data, isLoading };
}
