import {
  activities,
  localAuthorities,
  publishers,
  regions,
  type Activity,
  type LocalAuthority,
  type Publisher,
} from "../data/mock-feeds";

/** Sentinel value for unfiltered dimensions */
export const ALL_FILTER = "all" as const;

export type ExplorerFilters = {
  region: string;
  publisher: string;
  activity: string;
};

export const DEFAULT_EXPLORER_FILTERS: ExplorerFilters = {
  region: ALL_FILTER,
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

/** Publishers matching the current filter selection */
export function getFilteredPublishers(filters: ExplorerFilters): Publisher[] {
  let list = publishers;

  if (filters.region !== ALL_FILTER) {
    list = list.filter((p) => p.regionId === filters.region);
  }

  if (filters.activity !== ALL_FILTER) {
    list = list.filter((p) => p.activityIds.includes(filters.activity));
  }

  if (filters.publisher !== ALL_FILTER) {
    list = list.filter((p) => p.id === filters.publisher);
  }

  return list;
}

/** Activities available for the current publisher / region context */
export function getFilteredActivities(filters: ExplorerFilters): Activity[] {
  const activePublishers = getFilteredPublishers(filters);
  const activityIds = new Set(activePublishers.flatMap((p) => p.activityIds));

  let list = activities.filter((a) => activityIds.has(a.id));

  if (filters.activity !== ALL_FILTER) {
    list = list.filter((a) => a.id === filters.activity);
  }

  return list;
}

/**
 * Local authorities for the map and area count.
 * Opportunity counts are adjusted when filters narrow the contributing publishers.
 */
export function getFilteredLocalAuthorities(
  filters: ExplorerFilters
): LocalAuthority[] {
  const activePublishers = getFilteredPublishers(filters);

  if (filters.publisher !== ALL_FILTER) {
    const publisher = publishers.find((p) => p.id === filters.publisher);
    if (!publisher) return [];
    return allocatePublisherOpportunities(publisher);
  }

  let las = localAuthorities;

  if (filters.region !== ALL_FILTER) {
    las = las.filter((la) => la.regionId === filters.region);
  }

  if (activePublishers.length === publishers.length && filters.activity === ALL_FILTER) {
    return las;
  }

  const relevantLaIds = new Set(
    activePublishers.flatMap((p) => p.localAuthorityIds)
  );

  return las
    .filter((la) => relevantLaIds.has(la.id))
    .map((la) => scaleLocalAuthorityByPublishers(la, activePublishers));
}

/** Summary metrics for the explorer sidebar */
export function computeExplorerSummary(filters: ExplorerFilters): ExplorerSummary {
  const las = getFilteredLocalAuthorities(filters);
  const activePublishers = getFilteredPublishers(filters);
  const activeActivities = getFilteredActivities(filters);

  return {
    totalOpportunities: las.reduce((sum, la) => sum + la.opportunities, 0),
    areaCount: las.length,
    publisherCount: activePublishers.length,
    activityCount: activeActivities.length,
  };
}

export function buildRegionOptions(): ExplorerFilterOption[] {
  return [
    { value: ALL_FILTER, label: "All regions" },
    ...regions.map((r) => ({ value: r.id, label: r.name })),
  ];
}

export function buildPublisherOptions(
  filters: Pick<ExplorerFilters, "region" | "activity">
): ExplorerFilterOption[] {
  const list = getFilteredPublishers({
    ...DEFAULT_EXPLORER_FILTERS,
    region: filters.region,
    activity: filters.activity,
    publisher: ALL_FILTER,
  });

  return [
    { value: ALL_FILTER, label: "All publishers" },
    ...list.map((p) => ({ value: p.id, label: p.name })),
  ];
}

export function buildActivityOptions(
  filters: Pick<ExplorerFilters, "region" | "publisher">
): ExplorerFilterOption[] {
  const list = getFilteredActivities({
    ...DEFAULT_EXPLORER_FILTERS,
    region: filters.region,
    publisher: filters.publisher,
    activity: ALL_FILTER,
  });

  return [
    { value: ALL_FILTER, label: "All activities and facilities" },
    ...list.map((a) => ({ value: a.id, label: a.name })),
  ];
}

/**
 * When the current selection is invalid after a parent filter changes,
 * reset child filters to "all".
 */
export function normalizeExplorerFilters(filters: ExplorerFilters): ExplorerFilters {
  const normalized = { ...filters };

  const publisherOptions = buildPublisherOptions({
    region: normalized.region,
    activity: normalized.activity,
  });
  if (
    normalized.publisher !== ALL_FILTER &&
    !publisherOptions.some((o) => o.value === normalized.publisher)
  ) {
    normalized.publisher = ALL_FILTER;
  }

  const activityOptions = buildActivityOptions({
    region: normalized.region,
    publisher: normalized.publisher,
  });
  if (
    normalized.activity !== ALL_FILTER &&
    !activityOptions.some((o) => o.value === normalized.activity)
  ) {
    normalized.activity = ALL_FILTER;
  }

  return normalized;
}

function allocatePublisherOpportunities(publisher: Publisher): LocalAuthority[] {
  const las = localAuthorities.filter((la) =>
    publisher.localAuthorityIds.includes(la.id)
  );
  const weightSum = las.reduce((sum, la) => sum + la.opportunities, 0) || 1;

  return las.map((la) => ({
    ...la,
    opportunities: Math.round(
      (publisher.opportunities * la.opportunities) / weightSum
    ),
  }));
}

function scaleLocalAuthorityByPublishers(
  la: LocalAuthority,
  activePublishers: Publisher[]
): LocalAuthority {
  const covering = activePublishers.filter((p) =>
    p.localAuthorityIds.includes(la.id)
  );

  if (covering.length === 0) {
    return { ...la, opportunities: 0 };
  }

  const activeTotal = covering.reduce((sum, p) => sum + p.opportunities, 0);
  const allCovering = publishers.filter((p) =>
    p.localAuthorityIds.includes(la.id)
  );
  const corpusTotal = allCovering.reduce((sum, p) => sum + p.opportunities, 0);

  if (corpusTotal === 0) {
    return la;
  }

  return {
    ...la,
    opportunities: Math.round((la.opportunities * activeTotal) / corpusTotal),
  };
}
