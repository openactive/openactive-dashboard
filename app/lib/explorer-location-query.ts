import type { ExplorerFilters } from "./explore-filters";
import type { GeoHierarchy } from "./geo-hierarchy";
import {
  getAreaSelectionLabel,
  partitionAreaRefsToCodes,
} from "./area-selection";
import type { ActivitiesQuery } from "../types/activities";

export type LocationScopedItem = "publishers" | "activities" | "organizations";

/** Map the selected area refs to API district/region/country code arrays. */
export function buildLocationFilterQuery(
  filters: Pick<ExplorerFilters, "areas">,
  hierarchy: GeoHierarchy
): ActivitiesQuery {
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
  filters: Pick<ExplorerFilters, "areas">,
  hierarchy: GeoHierarchy,
  item: LocationScopedItem
): string {
  const noun =
    item === "publishers"
      ? "publishers"
      : item === "organizations"
        ? "providers"
        : "activities";

  if (filters.areas.length === 0) return `No ${noun} found`;
  if (filters.areas.length === 1) {
    return `No ${noun} in ${getAreaSelectionLabel(filters.areas, hierarchy)}`;
  }
  return `No ${noun} in the selected areas`;
}
