export type GeoArea = {
  name: string;
  geoCode: string;
  geoType: "lad" | "county";
};

export type GeoRegion = {
  id: string;
  code: string;
  label: string;
  areas: GeoArea[];
};

export type GeoCountry = {
  id: string;
  code: string;
  label: string;
  regions: GeoRegion[];
};

export type GeoHierarchy = {
  countries: GeoCountry[];
};

/** Scope key: all | country:{id} | region:{countryId}:{regionId} */
export function parseAreaScope(scope: string): {
  type: "all" | "country" | "region";
  countryId?: string;
  regionId?: string;
} {
  if (scope === "all") return { type: "all" };
  if (scope.startsWith("country:")) {
    return { type: "country", countryId: scope.slice(8) };
  }
  if (scope.startsWith("region:")) {
    const [, countryId, regionId] = scope.split(":");
    return { type: "region", countryId, regionId };
  }
  return { type: "all" };
}

/** All geo_names within a country or region scope */
export function getAreaNamesInScope(
  hierarchy: GeoHierarchy,
  areaScope: string
): string[] {
  const parsed = parseAreaScope(areaScope);
  if (parsed.type === "all") return [];

  const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
  if (!country) return [];

  if (parsed.type === "country") {
    return country.regions.flatMap((r) => r.areas.map((a) => a.name));
  }

  const region = country.regions.find((r) => r.id === parsed.regionId);
  return region ? region.areas.map((a) => a.name) : [];
}

/** Human-readable label for the current area selection */
export function getAreaSelectionLabel(
  hierarchy: GeoHierarchy,
  district: string,
  areaScope: string
): string {
  if (district !== "all") return district;

  const parsed = parseAreaScope(areaScope);
  if (parsed.type === "all") return "All areas";

  const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
  if (!country) return "All areas";

  if (parsed.type === "country") return country.label;

  const region = country.regions.find((r) => r.id === parsed.regionId);
  if (!region) return country.label;

  return `${country.label} › ${region.label}`;
}
