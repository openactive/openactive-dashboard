/** Sentinel value for unfiltered dimensions */
export const ALL_FILTER = "all" as const;

/** Non-selectable listbox rows (loading / empty state). */
export const FILTER_LOADING_VALUE = "__loading__" as const;
export const FILTER_EMPTY_VALUE = "__empty__" as const;

/** Which boundary set the area filter and map operate on. */
export type BoundaryType = "lad" | "nhs";

export type ExplorerFilters = {
  /** Whether the area filter and map use Local Authority districts or NHS Trusts. */
  boundaryType: BoundaryType;
  /** Selected area refs (country/region/district). Empty = all areas. Used in "lad" mode. */
  areas: string[];
  /** Selected NHS Trust codes (e.g. "R0A"). Empty = all trusts. Used in "nhs" mode. */
  nhsTrusts: string[];
  publisher: string[];
  organization: string[];
  /** Selected activity names. Empty array = no activity filter. */
  activity: string[];
};

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  boundaryType: "lad",
  areas: [],
  nhsTrusts: [],
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
  /** Which boundary the area metric counts: districts ("lad") or trusts ("nhs"). */
  boundaryType: BoundaryType;
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

// The area metric counts local authority districts in "lad" mode and NHS Trusts
// in "nhs" mode, so its label follows the boundary the numbers describe.
export function areaMetricLabel(
  boundaryType: BoundaryType,
  variant: "full" | "short" = "full",
): string {
  if (boundaryType === "nhs") return variant === "short" ? "Trusts" : "NHS Trusts";
  return variant === "short" ? "Areas" : "Local areas";
}

export type DistrictCount = {
  district: string;
  count: number;
};
