"use client";

import { useEffect, useRef, useState } from "react";
import {
  EXPLORER_TOP_LIMIT,
  type BoundaryType,
  type DistrictCount,
  type ExplorerFilters,
  type ExplorerSummary,
  type RankedItem,
} from "../lib/explore-filters";
import { buildLocationFilterQuery } from "../lib/explorer-location-query";
import type { GeoHierarchy } from "../lib/geo-hierarchy";
import { getOpportunities } from "../services/opportunities";
import type {
  Opportunity,
  OpportunitiesQuery,
} from "../types/opportunities";

export type PresentNames = {
  publishers: Set<string>;
  organizations: Set<string>;
  activities: Set<string>;
};

type Params = {
  filters: ExplorerFilters;
  hierarchy: GeoHierarchy;
  onResolved?: (presentNames: PresentNames) => void;
};

type Result = {
  summary: ExplorerSummary;
  districtCounts: DistrictCount[];
  isLoading: boolean;
};

/** Rendered data plus the present-name sets used to prune stale selections. */
type ReducedData = Omit<Result, "isLoading"> & {
  presentNames: PresentNames;
};

const EMPTY_PRESENT_NAMES: PresentNames = {
  publishers: new Set<string>(),
  organizations: new Set<string>(),
  activities: new Set<string>(),
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
 *  - totals for the choropleth. Local authority mode keys these by
 *    district_name; NHS mode keys them by nhstrust_code, so each joins
 *    directly with the map shapes it draws.
 */
function reduce(rows: Opportunity[], boundaryType: BoundaryType): ReducedData {
  const countByDistrict = new Map<string, number>();
  const countByTrust = new Map<string, number>();
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
    if (boundaryType === "nhs" && row.nhstrust_code) {
      bump(countByTrust, row.nhstrust_code, n);
    }
    if (row.publisher) bump(countByPublisher, row.publisher, n);
    if (row.provider) bump(countByFeed, row.provider, n);
    if (row.organization_names) bumpFromJsonArray(countByOrganization, row.organization_names, n);
    if (row.activity_or_facility) bumpFromJsonArray(countByActivity, row.activity_or_facility, n);
  }

  // The choropleth joins the map shapes it draws: district names for local
  // authorities, trust codes for NHS. The summary below stays district-keyed.
  const choroplethCounts =
    boundaryType === "nhs" ? countByTrust : countByDistrict;
  const districtCounts: DistrictCount[] = [...choroplethCounts.entries()]
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
    presentNames: {
      publishers: new Set(countByPublisher.keys()),
      organizations: new Set(countByOrganization.keys()),
      activities: new Set(countByActivity.keys()),
    },
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
  hierarchy,
  onResolved,
}: Params): Result {
  const [data, setData] = useState<Omit<Result, "isLoading">>({
    summary: EMPTY_SUMMARY,
    districtCounts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const cacheRef = useRef<Map<string, Promise<ReducedData>>>(new Map());
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
                summary: EMPTY_SUMMARY,
                districtCounts: [],
                presentNames: EMPTY_PRESENT_NAMES,
              }
            : reduce(rows, filters.boundaryType)
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
