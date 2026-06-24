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
  feedCount: 0,
  organizationCount: 0,
  activityCount: 0,
  activityOpportunities: 0,
  facilityOpportunities: 0,
  topAreas: [],
  topPublishers: [],
  topFeeds: [],
  topOrganizations: [],
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
  const countByFeed = new Map<string, number>();
  const countByOrganization = new Map<string, number>();
  const countByActivity = new Map<string, number>();
  let totalOpportunities = 0;
  let activityOpportunities = 0;
  let facilityOpportunities = 0;

  const bump = (m: Map<string, number>, key: string, n: number) =>
    m.set(key, (m.get(key) ?? 0) + n);

  const bumpFromJsonArray = (
    m: Map<string, number>,
    raw: string,
    n: number
  ) => {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    for (const v of parsed) {
      if (typeof v === "string" && v.trim()) bump(m, v, n);
    }
  };

  for (const row of rows) {
    const n = row.opportunity_count;
    totalOpportunities += n;
    if (row.is_activity) activityOpportunities += n;
    else facilityOpportunities += n;

    if (row.district_name) bump(countByDistrict, row.district_name, n);
    if (row.publisher) bump(countByPublisher, row.publisher, n);
    if (row.provider) bump(countByFeed, row.provider, n);
    if (row.organization_names) bumpFromJsonArray(countByOrganization, row.organization_names, n);
    if (row.activity_or_facility) bumpFromJsonArray(countByActivity, row.activity_or_facility, n);
  }

  const districtCounts: DistrictCount[] = [...countByDistrict.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  return {
    summary: {
      totalOpportunities,
      areaCount: countByDistrict.size,
      publisherCount: countByPublisher.size,
      feedCount: countByFeed.size,
      organizationCount: countByOrganization.size,
      activityCount: countByActivity.size,
      activityOpportunities,
      facilityOpportunities,
      topAreas: rankTop(countByDistrict, EXPLORER_TOP_LIMIT),
      topPublishers: rankTop(countByPublisher, EXPLORER_TOP_LIMIT),
      topFeeds: rankTop(countByFeed, EXPLORER_TOP_LIMIT),
      topOrganizations: rankTop(countByOrganization, EXPLORER_TOP_LIMIT),
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
 
  const cacheRef = useRef<Map<string, Promise<Omit<Result, "isLoading">>>>(
    new Map()
  );

  const locationQuery = buildLocationFilterQuery(filters, maps);
  const query: OpportunitiesQuery = {
    ...locationQuery,
    ...(filters.publisher.length > 0 ? { publisher: filters.publisher } : {}),
    ...(filters.organization !== ALL_FILTER ? { organization: filters.organization } : {}),
    ...(filters.activity.length > 0 ? { activity: filters.activity } : {}),
  };
  const cacheKey = JSON.stringify(query);

  useEffect(() => {
    let promise = cacheRef.current.get(cacheKey);
    if (!promise) {
      setIsLoading(true);
      promise = getOpportunities(query)
        .then((rows) =>
          rows.length === 0
            ? { summary: EMPTY_SUMMARY, districtCounts: [] }
            : reduce(rows)
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
