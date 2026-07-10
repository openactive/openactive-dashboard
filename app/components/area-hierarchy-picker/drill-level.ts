import type { DrillLevel } from "./types";

export function goBackDrill(current: DrillLevel): DrillLevel {

  if (current.type === "root" || current.type === "nhs") {
    return { type: "boundary-choice" };
  }

  if (current.type === "country") return { type: "root" };

  if (current.type === "region") {
    const isDirectCountryDistrictView =
      current.country.regions.length === 1 &&
      current.region.id === current.country.id &&
      current.region.label === current.country.label;

    if (isDirectCountryDistrictView) return { type: "root" };

    return { type: "country", country: current.country };
  }

  return { type: "boundary-choice" };
}

export function getPanelTitle(drill: DrillLevel): string {
  switch (drill.type) {
    case "boundary-choice":
      return "Choose boundary type";
    case "nhs":
      return "NHS Trusts";
    case "root":
      return "Local authorities";
    case "country":
      return drill.country.label;
    case "region":
      return `${drill.country.label} › ${drill.region.label}`;
  }
}

export function getBackLabel(drill: DrillLevel): string {
  if (drill.type === "region") return `Back to ${drill.country.label} regions`;
  if (drill.type === "country") return "Back to all countries";
  if (drill.type === "root" || drill.type === "nhs") {
    return "Back to boundary type";
  }
  return "";
}
