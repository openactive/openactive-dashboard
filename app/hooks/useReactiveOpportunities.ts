"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALL_FILTER,
  type DistrictCount,
  type ExplorerFilters,
  type ExplorerSummary,
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
  activityCount: 0,
};

/**
 * Reduce raw /opportunities rows into:
 *  - a summary (totals + unique counts) for the stats card
 *  - per-district totals for the choropleth, keyed by district_name
 *    so it joins directly with the geojson the map already uses.
 */
function reduce(rows: Opportunity[]): {
  summary: ExplorerSummary;
  districtCounts: DistrictCount[];
} {
  const districts = new Set<string>();
  const publishers = new Set<string>();
  const activities = new Set<string>();
  const countByDistrict = new Map<string, number>();
  let totalOpportunities = 0;

  for (const row of rows) {
    totalOpportunities += row.opportunity_count;

    if (row.district_code) districts.add(row.district_code);
    if (row.publisher) publishers.add(row.publisher);

    if (row.district_name) {
      countByDistrict.set(
        row.district_name,
        (countByDistrict.get(row.district_name) ?? 0) + row.opportunity_count
      );
    }

    // activity_or_facility is a JSON-encoded string array; parse defensively.
    if (row.activity_or_facility) {
      try {
        const parsed: unknown = JSON.parse(row.activity_or_facility);
        if (Array.isArray(parsed)) {
          for (const v of parsed) {
            if (typeof v === "string" && v.trim()) activities.add(v);
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
      areaCount: districts.size,
      publisherCount: publishers.size,
      activityCount: activities.size,
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
    ...(filters.activity !== ALL_FILTER ? { activity: filters.activity } : {}),
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
