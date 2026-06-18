import type { FeedQualityRow, FeedStatus } from "../types/feed-quality";

export const STATUS_LABELS: Record<FeedStatus, string> = {
  OK: "Healthy",
  WARNING: "Warning",
  ERROR: "Error",
};

export const STATUS_DOT_CLASS: Record<FeedStatus, string> = {
  OK: "bg-oa-cyan",
  WARNING: "bg-oa-yellow",
  ERROR: "bg-oa-scarlet",
};

export const COMPLETENESS_BANDS = {
  high: {
    label: "High completeness",
    description: "Field is present in 70–100% of items",
    cellClass: "bg-oa-cyan/15 text-oa-navy",
    dotClass: "bg-oa-cyan",
  },
  moderate: {
    label: "Moderate completeness",
    description: "Field is present in 35–70% of items",
    cellClass: "bg-oa-yellow/20 text-oa-navy",
    dotClass: "bg-oa-yellow",
  },
  low: {
    label: "Low completeness",
    description: "Field is present in 1–35% of items",
    cellClass: "bg-oa-scarlet/10 text-oa-navy",
    dotClass: "bg-oa-scarlet",
  },
  none: {
    label: "No completeness",
    description: "Items exist but never include this field (0%)",
    cellClass: "bg-oa-scarlet/25 text-oa-scarlet",
    dotClass: "bg-oa-scarlet",
  },
  na: {
    label: "Not assessed",
    description: "No future items in this feed to assess",
    cellClass: "bg-oa-grey-50 text-oa-grey-500",
    dotClass: "bg-oa-grey-300",
  },
} as const;

export type CompletenessBand = keyof typeof COMPLETENESS_BANDS;

export function getCompletenessBand(value: number | null): CompletenessBand {
  if (value === null) return "na";
  if (value === 0) return "none";
  if (value >= 70) return "high";
  if (value >= 35) return "moderate";
  return "low";
}

// Feeds are either activity-based or facility-based, never both.
function getActivityOrFacilityCompleteness(
  row: FeedQualityRow
): number | null {
  return row.activities_completeness ?? row.facilities_completeness;
}

// Average of the four fields the table colours in. Null when no field has a value.
function getQualityScore(row: FeedQualityRow): number | null {
  const values = [
    row.start_date_completeness,
    row.end_date_completeness,
    row.location_completeness,
    getActivityOrFacilityCompleteness(row),
  ].filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Returns -1 when no feed in the group can be scored, so those groups
// always sink to the bottom of a sort.
function getGroupQualityScore(group: FeedQualityGroup): number {
  const scores = group.feeds
    .map(getQualityScore)
    .filter((v): v is number => v !== null);
  if (scores.length === 0) return -1;
  return scores.reduce((sum, v) => sum + v, 0) / scores.length;
}

// Average of the four optional content fields the content-quality view
// colours in. Null when no field has a value.
function getContentScore(row: FeedQualityRow): number | null {
  const values = [
    row.age_range_completeness,
    row.level_completeness,
    row.accessibility_support_completeness,
    row.gender_restriction_completeness,
  ].filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getGroupContentScore(group: FeedQualityGroup): number {
  const scores = group.feeds
    .map(getContentScore)
    .filter((v): v is number => v !== null);
  if (scores.length === 0) return -1;
  return scores.reduce((sum, v) => sum + v, 0) / scores.length;
}

export function getGroupActivityCount(group: FeedQualityGroup): number {
  return group.feeds.reduce(
    (sum, f) => sum + f.num_future_opportunity_items,
    0
  );
}

// "ScheduledSession" -> "Scheduled session"
export function humaniseFeedType(feedType: string): string {
  const spaced = feedType.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

// Higher number = worse status.
export const STATUS_RANK: Record<FeedStatus, number> = {
  OK: 0,
  WARNING: 1,
  ERROR: 2,
};

function getWorstStatus(rows: FeedQualityRow[]): FeedStatus {
  return rows.reduce<FeedStatus>(
    (worst, row) =>
      STATUS_RANK[row.status] > STATUS_RANK[worst] ? row.status : worst,
    "OK"
  );
}

// Some publishers ship a useless generic name. When they do, fall back
// to the URL subdomain so the table still shows something identifiable.
const GENERIC_DATASET_NAMES = new Set([
  "sessions and facilities",
  "openactive",
]);

function humaniseSubdomain(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    const first = hostname.split(".")[0];
    if (!first) return null;
    return first
      .replace(/-openactive$/i, "")
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return null;
  }
}

function getDatasetDisplayName(row: FeedQualityRow): string {
  const trimmed = row.dataset_name.trim();
  const isGeneric =
    !trimmed || GENERIC_DATASET_NAMES.has(trimmed.toLowerCase());
  if (!isGeneric) return trimmed;
  return humaniseSubdomain(row.dataset_url) ?? "Unknown publisher";
}

export interface FeedQualityGroup {
  datasetUrl: string;
  datasetName: string;
  worstStatus: FeedStatus;
  feeds: FeedQualityRow[];
}

export function groupFeedsByDataset(
  rows: FeedQualityRow[]
): FeedQualityGroup[] {
  const buckets = new Map<string, FeedQualityRow[]>();
  for (const row of rows) {
    const existing = buckets.get(row.dataset_url);
    if (existing) existing.push(row);
    else buckets.set(row.dataset_url, [row]);
  }

  return Array.from(buckets, ([datasetUrl, feeds]) => ({
    datasetUrl,
    datasetName: getDatasetDisplayName(feeds[0]),
    worstStatus: getWorstStatus(feeds),
    feeds,
  }));
}

export function formatLastAssessed(iso: string): {
  relative: string;
  absolute: string;
} {
  const date = new Date(iso);
  const absolute = date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  const diffHr = Math.round(diffMs / 3_600_000);
  const diffDay = Math.round(diffMs / 86_400_000);

  let relative: string;
  if (diffMin < 1) relative = "Just now";
  else if (diffMin < 60) relative = `${diffMin} min ago`;
  else if (diffHr < 24)
    relative = `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  else relative = `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

  return { relative, absolute };
}

export type FeedQualityView = "data" | "content";

interface CompletenessColumn {
  key: string;
  label: string;
  hint: string;
  get: (row: FeedQualityRow) => number | null;
}

export interface FeedQualityViewConfig {
  view: FeedQualityView;
  label: string;
  qualityHint: string;
  getScore: (row: FeedQualityRow) => number | null;
  getGroupScore: (group: FeedQualityGroup) => number;
  completenessColumns: readonly CompletenessColumn[];
}

export const FEED_QUALITY_VIEWS: readonly FeedQualityView[] = [
  "data",
  "content",
];

export const VIEW_CONFIGS: Record<FeedQualityView, FeedQualityViewConfig> = {
  data: {
    view: "data",
    label: "Data completeness",
    qualityHint:
      "Average completeness across location, activity/facility, and start and end dates",
    getScore: getQualityScore,
    getGroupScore: getGroupQualityScore,
    completenessColumns: [
      {
        key: "location",
        label: "Location",
        hint: "% of future items with a geographic location",
        get: (r) => r.location_completeness,
      },
      {
        key: "activity",
        label: "Activity / Facility",
        hint: "% of future items naming an activity or facility",
        get: getActivityOrFacilityCompleteness,
      },
    ],
  },
  content: {
    view: "content",
    label: "Content quality",
    qualityHint:
      "Average completeness across age range, level, accessibility support, and gender restriction",
    getScore: getContentScore,
    getGroupScore: getGroupContentScore,
    completenessColumns: [
      {
        key: "age-range",
        label: "Age range",
        hint: "% of future items with an age range",
        get: (r) => r.age_range_completeness,
      },
      {
        key: "level",
        label: "Level",
        hint: "% of future items naming a difficulty level",
        get: (r) => r.level_completeness,
      },
      {
        key: "accessibility",
        label: "Accessibility",
        hint: "% of future items naming accessibility support",
        get: (r) => r.accessibility_support_completeness,
      },
      {
        key: "gender",
        label: "Gender restriction",
        hint: "% of future items naming a gender restriction",
        get: (r) => r.gender_restriction_completeness,
      },
    ],
  },
};
