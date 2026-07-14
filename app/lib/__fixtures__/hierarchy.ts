import { transformAreasToHierarchy } from "../areas-to-hierarchy";
import type { GeoArea, GeoCountry, GeoHierarchy, GeoRegion } from "../geo-hierarchy";
import type { ExplorerFilterOption } from "../explore-filters";
import { sampleAreasResponse } from "./areas-response";

/** Hierarchy built from {@link sampleAreasResponse} — use in filter/map tests. */
export const testHierarchy: GeoHierarchy =
  transformAreasToHierarchy(sampleAreasResponse);

/** Well-known districts for assertions (hierarchy canonical names). */
export const HARTLEPOOL = {
  name: "Hartlepool",
  geoCode: "E06000001",
  countryLabel: "England",
  regionLabel: "North East",
} as const;

export const MIDDLESBROUGH = {
  name: "Middlesbrough",
  geoCode: "E06000002",
  countryLabel: "England",
  regionLabel: "North East",
} as const;

/** Basemap label can differ from /areas hierarchy name — see resolveDistrictNameFromMap. */
export const LEWES = {
  hierarchyName: "Lewes District",
  mapName: "Lewes",
  geoCode: "E06000059",
  countryLabel: "England",
  regionLabel: "South East",
} as const;

export const HIGHLAND = {
  name: "Highland",
  geoCode: "S12000017",
  countryLabel: "Scotland",
} as const;

export const sampleNhsTrustOptions: ExplorerFilterOption[] = [
  { value: "R0A", label: "Manchester University NHS Foundation Trust" },
  { value: "R1H", label: "Barts Health NHS Trust" },
];

function walkHierarchy(
  hierarchy: GeoHierarchy,
  visit: (ctx: {
    country: GeoCountry;
    region: GeoRegion;
    area: GeoArea;
  }) => void
): void {
  for (const country of hierarchy.countries) {
    for (const region of country.regions) {
      for (const area of region.areas) {
        visit({ country, region, area });
      }
    }
  }
}

/** Find a district by hierarchy name across all countries/regions. */
export function findDistrictByName(
  hierarchy: GeoHierarchy,
  name: string
): GeoArea | undefined {
  let found: GeoArea | undefined;
  walkHierarchy(hierarchy, ({ area }) => {
    if (area.name === name) found = area;
  });
  return found;
}

/** Find a district by ONS code. */
export function findDistrictByCode(
  hierarchy: GeoHierarchy,
  geoCode: string
): GeoArea | undefined {
  let found: GeoArea | undefined;
  walkHierarchy(hierarchy, ({ area }) => {
    if (area.geoCode === geoCode) found = area;
  });
  return found;
}

export function getEngland(hierarchy: GeoHierarchy = testHierarchy): GeoCountry {
  const country = hierarchy.countries.find((c) => c.label === "England");
  if (!country) throw new Error("England not found in test hierarchy");
  return country;
}

export function getScotland(hierarchy: GeoHierarchy = testHierarchy): GeoCountry {
  const country = hierarchy.countries.find((c) => c.label === "Scotland");
  if (!country) throw new Error("Scotland not found in test hierarchy");
  return country;
}
