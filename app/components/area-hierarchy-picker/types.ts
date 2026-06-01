import type { GeoCountry, GeoRegion } from "../../lib/geo-hierarchy";

export type AreaPickerVariant = "default" | "glass" | "sheet";

export type DrillLevel =
  | { type: "root" }
  | { type: "country"; country: GeoCountry }
  | { type: "region"; country: GeoCountry; region: GeoRegion };
