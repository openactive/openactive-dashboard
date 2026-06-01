import { ALL_FILTER } from "../../lib/explore-filters";
import type { GeoHierarchy } from "../../lib/geo-hierarchy";
import { parseAreaScope } from "../../lib/geo-hierarchy";
import type { DrillLevel } from "./types";

/** Restore drill depth from the active filter so reopening shows the relevant level. */
export function drillLevelForSelection(
  hierarchy: GeoHierarchy,
  district: string,
  areaScope: string
): DrillLevel {
  if (district !== ALL_FILTER) {
    for (const country of hierarchy.countries) {
      for (const region of country.regions) {
        if (region.areas.some((a) => a.name === district)) {
          return { type: "region", country, region };
        }
      }
    }
    return { type: "root" };
  }

  const parsed = parseAreaScope(areaScope);
  if (parsed.type === "all") return { type: "root" };

  const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
  if (!country) return { type: "root" };

  if (parsed.type === "country") {
    if (country.regions.length === 1 && country.regions[0]) {
      return { type: "region", country, region: country.regions[0] };
    }
    return { type: "country", country };
  }

  const region = country.regions.find((r) => r.id === parsed.regionId);
  if (region) return { type: "region", country, region };

  return { type: "root" };
}

export function goBackDrill(current: DrillLevel): DrillLevel {
  if (current.type !== "region") return { type: "root" };

  const isDirectCountryDistrictView =
    current.country.regions.length === 1 &&
    current.region.id === current.country.id &&
    current.region.label === current.country.label;

  if (isDirectCountryDistrictView) return { type: "root" };

  return { type: "country", country: current.country };
}

export function getPanelTitle(drill: DrillLevel): string {
  if (drill.type === "root") return "Choose a country";
  if (drill.type === "country") return drill.country.label;
  return `${drill.country.label} › ${drill.region.label}`;
}

export function getBackLabel(drill: DrillLevel): string {
  if (drill.type === "region") return `Back to ${drill.country.label} regions`;
  if (drill.type === "country") return "Back to all countries";
  return "";
}
