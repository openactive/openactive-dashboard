import type { GeoCountry, GeoRegion } from "../../lib/geo-hierarchy";

export type AreaPickerVariant = "default" | "glass" | "sheet";

export type DrillLevel =
  // Entry screen: choose Local Authority or NHS Trust boundaries.
  | { type: "boundary-choice" }
  // NHS Trust list (when NHS boundaries are chosen).
  | { type: "nhs" }
  // Local Authority drill-down: countries → regions → districts.
  | { type: "root" }
  | { type: "country"; country: GeoCountry }
  | { type: "region"; country: GeoCountry; region: GeoRegion };

// The Local Authority drill levels only (no boundary-choice / NHS screens).
export type AreaDrillLevel = Extract<
  DrillLevel,
  { type: "root" | "country" | "region" }
>;
