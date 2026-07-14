import {
  EXPLORER_TOP_LIMIT,
  type BoundaryType,
  type DistrictCount,
  type ExplorerSummary,
  type RankedItem,
} from "./explore-filters";
import type { Opportunity } from "../types/opportunities";

export type PresentNames = {
  publishers: Set<string>;
  organizations: Set<string>;
  activities: Set<string>;
};

/** Reduced /opportunities payload for the summary panel and choropleth. */
export type ReducedOpportunities = {
  summary: ExplorerSummary;
  districtCounts: DistrictCount[];
  presentNames: PresentNames;
};

export const EMPTY_PRESENT_NAMES: PresentNames = {
  publishers: new Set<string>(),
  organizations: new Set<string>(),
  activities: new Set<string>(),
};

export const EMPTY_SUMMARY: ExplorerSummary = {
  boundaryType: "lad",
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

/** Sort a name→count map highest first and keep the top N entries. */
export function rankTop(
  map: Map<string, number>,
  limit: number
): RankedItem[] {
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Turn raw /opportunities rows into summary totals, top lists, choropleth
 * counts, and the name sets used to drop stale filter selections.
 *
 * Local authority mode keys the map by district name; NHS mode keys it by
 * trust code so each joins the basemap shapes.
 */
export function reduceOpportunities(
  rows: Opportunity[],
  boundaryType: BoundaryType
): ReducedOpportunities {
  const countByDistrict = new Map<string, number>();
  const countByTrust = new Map<string, number>();
  const countByTrustName = new Map<string, number>();
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
    if (boundaryType === "nhs" && row.nhstrust_name) {
      bump(countByTrustName, row.nhstrust_name, n);
    }
    if (row.publisher) bump(countByPublisher, row.publisher, n);
    if (row.provider) bump(countByFeed, row.provider, n);
    if (row.organization_names)
      bumpFromJsonArray(countByOrganization, row.organization_names, n);
    if (row.activity_or_facility)
      bumpFromJsonArray(countByActivity, row.activity_or_facility, n);
  }

  const choroplethCounts =
    boundaryType === "nhs" ? countByTrust : countByDistrict;
  const districtCounts: DistrictCount[] = [...choroplethCounts.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  const summaryAreaCounts =
    boundaryType === "nhs" ? countByTrustName : countByDistrict;

  return {
    summary: {
      boundaryType,
      totalOpportunities,
      areaCount: summaryAreaCounts.size,
      publisherCount: countByPublisher.size,
      feedCount: countByFeed.size,
      organizationCount: countByOrganization.size,
      activityCount: countByActivity.size,
      activityOpportunities,
      facilityOpportunities,
      topAreas: rankTop(summaryAreaCounts, EXPLORER_TOP_LIMIT),
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
