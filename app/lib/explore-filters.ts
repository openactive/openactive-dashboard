/** Sentinel value for unfiltered dimensions */
export const ALL_FILTER = "all" as const;

/** Non-selectable listbox rows (loading / empty state). */
export const FILTER_LOADING_VALUE = "__loading__" as const;
export const FILTER_EMPTY_VALUE = "__empty__" as const;

export type ExplorerFilters = {
  /** Selected area refs (country/region/district). Empty = all areas. */
  areas: string[];
  publisher: string[];
  organization: string[];
  /** Selected activity names. Empty array = no activity filter. */
  activity: string[];
};

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  areas: [],
  publisher: [],
  organization: [],
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
  feedCount: number;
  organizationCount: number;
  activityCount: number;
  /** Opportunities flagged is_activity=true — Physical Activity (sessions, classes, events). */
  activityOpportunities: number;
  /** Opportunities flagged is_activity=false — Facility Use (spaces, equipment). */
  facilityOpportunities: number;
  topAreas: RankedItem[];
  topPublishers: RankedItem[];
  topFeeds: RankedItem[];
  topOrganizations: RankedItem[];
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
    desktopLabel: "Feed Publishers",
    mobileLabel: "Publishers",
    color: "bg-oa-blue",
  },
  organizationCount: {
    desktopLabel: "Activity/Facility Providers",
    mobileLabel: "Providers",
    color: "bg-oa-purple",
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
  "organizationCount",
  "activityCount",
];

export type DistrictCount = {
  district: string;
  count: number;
};
