import type { CrossTabRow } from "./explore-csv";
import type { GeoHierarchy } from "./geo-hierarchy";
import { getAreaNamesInScope } from "./geo-hierarchy";

/** Sentinel value for unfiltered dimensions */
export const ALL_FILTER = "all" as const;

export type ExplorerFilters = {
  /** Specific local area (geo_name, resolved from geocode in CSV) */
  district: string;
  /** Geographic scope when no specific area: all | country:{id} | region:{country}:{region} */
  areaScope: string;
  publisher: string;
  activity: string;
};

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  district: ALL_FILTER,
  areaScope: ALL_FILTER,
  publisher: ALL_FILTER,
  activity: ALL_FILTER,
};

export type ExplorerFilterOption = {
  value: string;
  label: string;
};

export type ExplorerSummary = {
  totalOpportunities: number;
  areaCount: number;
  publisherCount: number;
  activityCount: number;
};

export type DistrictCount = {
  district: string;
  count: number;
};

type FilterKey = keyof ExplorerFilters;

/** Apply a specific area and clear broader scope */
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

/** Apply country or region scope (no single area) */
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

/** Rows matching all active filters */
export function filterRows(
  rows: CrossTabRow[],
  filters: ExplorerFilters,
  hierarchy?: GeoHierarchy
): CrossTabRow[] {
  const scopeNames =
    filters.district === ALL_FILTER &&
    filters.areaScope !== ALL_FILTER &&
    hierarchy
      ? new Set(getAreaNamesInScope(hierarchy, filters.areaScope))
      : null;

  return rows.filter((row) => {
    if (filters.district !== ALL_FILTER) {
      if (row.district !== filters.district) return false;
    } else if (scopeNames && scopeNames.size > 0) {
      if (row.district && !scopeNames.has(row.district)) return false;
    }

    if (
      filters.publisher !== ALL_FILTER &&
      row.publisher !== filters.publisher
    ) {
      return false;
    }
    if (filters.activity !== ALL_FILTER && row.activity !== filters.activity) {
      return false;
    }
    return true;
  });
}

/** Filter rows while ignoring one dimension (for building dropdown options) */
function filterRowsExcept(
  rows: CrossTabRow[],
  filters: ExplorerFilters,
  except: FilterKey,
  hierarchy?: GeoHierarchy
): CrossTabRow[] {
  const areaExcept = except === "district" || except === "areaScope";
  const patched: ExplorerFilters = areaExcept
    ? { ...filters, district: ALL_FILTER, areaScope: ALL_FILTER }
    : filters;

  return filterRows(rows, patched, hierarchy);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
}

/** Summary metrics for the explorer sidebar */
export function computeExplorerSummary(
  filtered: CrossTabRow[]
): ExplorerSummary {
  const districts = new Set<string>();
  const publishers = new Set<string>();
  const activities = new Set<string>();
  let totalOpportunities = 0;

  for (const row of filtered) {
    totalOpportunities += row.count;
    if (row.district) districts.add(row.district);
    if (row.publisher) publishers.add(row.publisher);
    if (row.activity) activities.add(row.activity);
  }

  return {
    totalOpportunities,
    areaCount: districts.size,
    publisherCount: publishers.size,
    activityCount: activities.size,
  };
}

/** Opportunity counts per district for the choropleth (geo_name join) */
export function getDistrictCounts(filtered: CrossTabRow[]): DistrictCount[] {
  const totals = new Map<string, number>();

  for (const row of filtered) {
    if (!row.district) continue;
    totals.set(row.district, (totals.get(row.district) ?? 0) + row.count);
  }

  return [...totals.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildPublisherOptions(
  rows: CrossTabRow[],
  filters: Pick<ExplorerFilters, "district" | "areaScope" | "activity">,
  hierarchy?: GeoHierarchy
): ExplorerFilterOption[] {
  const scoped = filterRowsExcept(
    rows,
    { ...DEFAULT_EXPLORER_FILTERS, ...filters, publisher: ALL_FILTER },
    "publisher",
    hierarchy
  );
  const publishers = uniqueSorted(
    scoped.map((r) => r.publisher).filter(Boolean)
  );

  return [
    { value: ALL_FILTER, label: "All publishers" },
    ...publishers.map((p) => ({ value: p, label: p })),
  ];
}

export function buildActivityOptions(
  rows: CrossTabRow[],
  filters: Pick<ExplorerFilters, "district" | "areaScope" | "publisher">,
  hierarchy?: GeoHierarchy
): ExplorerFilterOption[] {
  const scoped = filterRowsExcept(
    rows,
    { ...DEFAULT_EXPLORER_FILTERS, ...filters, activity: ALL_FILTER },
    "activity",
    hierarchy
  );
  const activities = uniqueSorted(
    scoped.map((r) => r.activity).filter(Boolean)
  );

  return [
    { value: ALL_FILTER, label: "All activities and facilities" },
    ...activities.map((a) => ({ value: a, label: a })),
  ];
}

/** Reset child filters when a parent filter change makes them invalid */
export function normalizeExplorerFilters(
  rows: CrossTabRow[],
  filters: ExplorerFilters,
  hierarchy?: GeoHierarchy
): ExplorerFilters {
  const normalized = { ...filters };

  if (normalized.district !== ALL_FILTER) {
    normalized.areaScope = ALL_FILTER;
  }

  const publisherOptions = buildPublisherOptions(
    rows,
    {
      district: normalized.district,
      areaScope: normalized.areaScope,
      activity: normalized.activity,
    },
    hierarchy
  );
  if (
    normalized.publisher !== ALL_FILTER &&
    !publisherOptions.some((o) => o.value === normalized.publisher)
  ) {
    normalized.publisher = ALL_FILTER;
  }

  const activityOptions = buildActivityOptions(
    rows,
    {
      district: normalized.district,
      areaScope: normalized.areaScope,
      publisher: normalized.publisher,
    },
    hierarchy
  );
  if (
    normalized.activity !== ALL_FILTER &&
    !activityOptions.some((o) => o.value === normalized.activity)
  ) {
    normalized.activity = ALL_FILTER;
  }

  const scopedRows = filterRows(rows, normalized, hierarchy);
  if (
    normalized.district !== ALL_FILTER &&
    !scopedRows.some((r) => r.district === normalized.district)
  ) {
    normalized.district = ALL_FILTER;
  }

  return normalized;
}
