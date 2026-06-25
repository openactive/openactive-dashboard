import type { DrillLevel } from "./types";

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
