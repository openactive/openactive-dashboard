import { ALL_FILTER, type ExplorerFilters } from "./explore-filters";
import type { GeoHierarchy } from "./geo-hierarchy";
import { parseAreaScope } from "./geo-hierarchy";
import type { ActivitiesQuery } from "../types/activities";

export type LocationScopedItem = "publishers" | "activities";

type CodeMaps = {
  districtCodeByName: Map<string, string>;
  countryCodeById: Map<string, string>;
  regionCodeByScope: Map<string, string>;
};

/** Map explorer area filters to API district/region/country codes. */
export function buildLocationFilterQuery(
  filters: Pick<ExplorerFilters, "district" | "areaScope">,
  maps: CodeMaps
): ActivitiesQuery {
  if (filters.district !== ALL_FILTER) {
    const districtCode = maps.districtCodeByName.get(filters.district);
    return districtCode ? { district: districtCode } : {};
  }

  const parsed = parseAreaScope(filters.areaScope);
  if (parsed.type === "country" && parsed.countryId) {
    const code = maps.countryCodeById.get(parsed.countryId);
    return code ? { country: code } : {};
  }

  if (
    parsed.type === "region" &&
    parsed.countryId &&
    parsed.regionId
  ) {
    const countryCode = maps.countryCodeById.get(parsed.countryId);
    const regionCode = maps.regionCodeByScope.get(
      `${parsed.countryId}:${parsed.regionId}`
    );
    return {
      ...(countryCode ? { country: countryCode } : {}),
      ...(regionCode ? { region: regionCode } : {}),
    };
  }

  return {};
}

/** User-facing message when a location-scoped API returns no items. */
export function getLocationEmptyMessage(
  filters: Pick<ExplorerFilters, "district" | "areaScope">,
  hierarchy: GeoHierarchy,
  item: LocationScopedItem
): string {
  const noun = item === "publishers" ? "publishers" : "activities";

  if (filters.district !== ALL_FILTER) {
    return `No ${noun} in ${filters.district}`;
  }

  const parsed = parseAreaScope(filters.areaScope);
  if (parsed.type === "country" && parsed.countryId) {
    const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
    return `No ${noun} in ${country?.label ?? "this country"}`;
  }

  if (parsed.type === "region" && parsed.countryId && parsed.regionId) {
    const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
    const region = country?.regions.find((r) => r.id === parsed.regionId);
    if (region) return `No ${noun} in ${region.label}`;
  }

  return `No ${noun} found`;
}
