import type { FeedQualityRow, FeedStatus } from "../types/feed-quality";

export const STATUS_LABELS: Record<FeedStatus, string> = {
  OK: "Healthy",
  WARNING: "Warning",
  ERROR: "Error",
};

export const COMPLETENESS_BANDS = {
  high: {
    label: "High completeness",
    description: "Field is present in 70–100% of items",
    cellClass: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    dotClass: "bg-emerald-500",
  },
  moderate: {
    label: "Moderate completeness",
    description: "Field is present in 35–70% of items",
    cellClass: "bg-amber-50 text-amber-900 ring-amber-200",
    dotClass: "bg-amber-500",
  },
  low: {
    label: "Low completeness",
    description: "Field is present in 1–35% of items",
    cellClass: "bg-red-50 text-red-900 ring-red-200",
    dotClass: "bg-red-500",
  },
  none: {
    label: "No completeness",
    description: "Items exist but never include this field (0%)",
    cellClass: "bg-red-100 text-red-950 ring-red-300",
    dotClass: "bg-red-600",
  },
  na: {
    label: "Not assessed",
    description: "No future items in this feed to assess",
    cellClass: "bg-slate-50 text-slate-500 ring-slate-200",
    dotClass: "bg-slate-300",
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

const STATUS_RANK: Record<FeedStatus, number> = {
  OK: 0,
  WARNING: 1,
  ERROR: 2,
};

export function getWorstStatus(rows: FeedQualityRow[]): FeedStatus {
  return rows.reduce<FeedStatus>(
    (worst, row) =>
      STATUS_RANK[row.status] > STATUS_RANK[worst] ? row.status : worst,
    "OK"
  );
}

// Some publishers send a generic dataset_name like "Sessions and Facilities".
// When that happens we humanise the dataset_url subdomain instead so the
// table still shows something identifiable.
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

export function getDatasetDisplayName(row: FeedQualityRow): string {
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
