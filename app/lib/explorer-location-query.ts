import type { ExplorerFilters } from "./explore-filters";
import type { GeoHierarchy } from "./geo-hierarchy";
import {
  getAreaSelectionLabel,
  partitionAreaRefsToCodes,
} from "./area-selection";
import type { ActivitiesQuery } from "../types/activities";

export type LocationScopedItem = "publishers" | "activities" | "organizations";

/**
 * Build the location filter for the API.
 *
 * In "lad" mode, maps the selected area refs to district/region/country code
 * arrays. In "nhs" mode, ignores areas and filters by the selected trust codes.
 */
export function buildLocationFilterQuery(
  filters: Pick<ExplorerFilters, "areas" | "boundaryType" | "nhsTrusts">,
  hierarchy: GeoHierarchy
): ActivitiesQuery {
  if (filters.boundaryType === "nhs") {
    return filters.nhsTrusts.length ? { nhs_trust: filters.nhsTrusts } : {};
  }

  const { country, region, district } = partitionAreaRefsToCodes(
    filters.areas,
    hierarchy
  );
  return {
    ...(district.length ? { district } : {}),
    ...(region.length ? { region } : {}),
    ...(country.length ? { country } : {}),
  };
}

/** User-facing message when a location-scoped API returns no items. */
export function getLocationEmptyMessage(
  filters: Pick<ExplorerFilters, "areas" | "boundaryType" | "nhsTrusts">,
  hierarchy: GeoHierarchy,
  item: LocationScopedItem
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
