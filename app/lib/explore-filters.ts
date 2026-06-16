/** Sentinel value for unfiltered dimensions */
export const ALL_FILTER = "all" as const;

/** Non-selectable listbox rows (loading / empty state). */
export const FILTER_LOADING_VALUE = "__loading__" as const;
export const FILTER_EMPTY_VALUE = "__empty__" as const;

export type ExplorerFilters = {
  /** Specific local area (district name, matched against geojson) */
  district: string;
  /** Geographic scope when no specific area: all | country:{id} | region:{country}:{region} */
  areaScope: string;
  publisher: string;
  /** Selected activity names. Empty array = no activity filter. */
  activity: string[];
};

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  district: ALL_FILTER,
  areaScope: ALL_FILTER,
  publisher: ALL_FILTER,
  activity: [],
};

export type ExplorerFilterOption = {
  value: string;
  label: string;
};

export type RankedItem = { name: string; count: number };

export type ExplorerSummary = {
  totalOpportunities: number;
  areaCount: number;
  publisherCount: number;
  providerCount: number;
  activityCount: number;
  /** Opportunities flagged is_activity=true — Physical Activity (sessions, classes, events). */
  activityOpportunities: number;
  /** Opportunities flagged is_activity=false — Facility Use (spaces, equipment). */
  facilityOpportunities: number;
  topAreas: RankedItem[];
  topPublishers: RankedItem[];
  topProviders: RankedItem[];
  topActivities: RankedItem[];
};

export const EXPLORER_TOP_LIMIT = 10;

export const EXPLORER_SUMMARY_METRIC_DEFS = {
  areaCount: {
    desktopLabel: "Local areas",
    mobileLabel: "Areas",
    color: "bg-oa-cyan",
  },
  publisherCount: {
    desktopLabel: "Publishers",
    mobileLabel: "Publishers",
    color: "bg-oa-blue",
  },
  activityCount: {
    desktopLabel: "Activities",
    mobileLabel: "Activities",
    color: "bg-oa-indigo",
  },
} as const;

export type ExplorerSummaryMetricKey = keyof typeof EXPLORER_SUMMARY_METRIC_DEFS;

export const EXPLORER_SUMMARY_METRIC_KEYS: ExplorerSummaryMetricKey[] = [
  "areaCount",
  "publisherCount",
  "activityCount",
];

export type DistrictCount = {
  district: string;
  count: number;
};

export function selectArea(
  filters: ExplorerFilters,
  areaName: string
): ExplorerFilters {
  return {
    ...filters,
    district: areaName,
    areaScope: ALL_FILTER,
  };
}

export function selectAreaScope(
  filters: ExplorerFilters,
  scope: string
): ExplorerFilters {
  return {
    ...filters,
    district: ALL_FILTER,
    areaScope: scope === ALL_FILTER ? ALL_FILTER : scope,
  };
}
