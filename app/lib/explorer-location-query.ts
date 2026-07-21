import { ALL_FILTER, type ExplorerFilters } from "./explore-filters";
import type { GeoHierarchy } from "./geo-hierarchy";
import {
  getAreaSelectionLabel,
  partitionAreaRefsToCodes,
} from "./area-selection";
import type { ActivitiesQuery } from "../types/activities";
import type { FilterQuery } from "../services/filter-params";

export type LocationScopedItem = "publishers" | "activities" | "organizations";

/**
 * Build the location filter for the API.
 *
 * In "lad" mode, maps the selected area refs to district/region/country code
 * arrays. In "nhs" mode, ignores areas and filters by trust codes; an empty
 * selection sends nhs_trus=all so that the API can return NHS-scoped aggregates.
 */
export function buildLocationFilterQuery(
  filters: Pick<ExplorerFilters, "areas" | "boundaryType" | "nhsTrusts">,
  hierarchy: GeoHierarchy,
): ActivitiesQuery {
  if (filters.boundaryType === "nhs") {
    return {
      nhs_trust: filters.nhsTrusts.length ? filters.nhsTrusts : [ALL_FILTER],
    };
  }

  const { country, region, district } = partitionAreaRefsToCodes(
    filters.areas,
    hierarchy,
  );
  return {
    ...(district.length ? { district } : {}),
    ...(region.length ? { region } : {}),
    ...(country.length ? { country } : {}),
  };
}

/**
 * Build the full filter query for the feed-quality endpoint. Used to keep
 * the feed-quality list in step with the explorer's current search.
 */
export function buildFeedQualityQuery(
  filters: Pick<
    ExplorerFilters,
    | "areas"
    | "boundaryType"
    | "nhsTrusts"
    | "publisher"
    | "organization"
    | "activity"
  >,
  hierarchy: GeoHierarchy,
): FilterQuery {
  return {
    ...buildLocationFilterQuery(filters, hierarchy),
    ...(filters.publisher.length ? { publisher: filters.publisher } : {}),
    ...(filters.organization.length
      ? { organization: filters.organization }
      : {}),
    ...(filters.activity.length ? { activity: filters.activity } : {}),
  };
}

/** User-facing message when a location-scoped API returns no items. */
export function getLocationEmptyMessage(
  filters: Pick<ExplorerFilters, "areas" | "boundaryType" | "nhsTrusts">,
  hierarchy: GeoHierarchy,
  item: LocationScopedItem,
): string {
  const noun =
    item === "publishers"
      ? "publishers"
      : item === "organizations"
        ? "providers"
        : "activities";

  if (filters.boundaryType === "nhs") {
    if (filters.nhsTrusts.length === 0) return `No ${noun} found`;
    const where =
      filters.nhsTrusts.length === 1
        ? "the selected NHS Trust"
        : "the selected NHS Trusts";
    return `No ${noun} in ${where}`;
  }

  if (filters.areas.length === 0) return `No ${noun} found`;
  if (filters.areas.length === 1) {
    return `No ${noun} in ${getAreaSelectionLabel(filters.areas, hierarchy)}`;
  }
  return `No ${noun} in the selected areas`;
}
