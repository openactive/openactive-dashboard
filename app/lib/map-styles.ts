import * as d3 from "d3";

export const GEOJSON_URL = "/api/boundaries";

export const LAND_FILL = "#dce4ec";
export const LAND_STROKE = "#a8b8c8";
export const FOCUS_STROKE = "#e21483";

const BASE_STROKE = "#8fa3b8";
const OUT_OF_SCOPE_FILL = "#e8edf2";
const OUT_OF_SCOPE_STROKE = "#c5ced8";
const NO_DATA_FILL = "#7fa8c9";
const SELECTED_STROKE = "#223582";
const SELECTED_FILL_FALLBACK = "#009de1";

export interface GeoProperties {
  geo_code: string;
  geo_name: string;
  geo_type: string;
}

export interface LadFeature {
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties?: GeoProperties;
}

export interface LadCollection {
  type: "FeatureCollection";
  features: LadFeature[];
}

export function buildColorScale(counts: Map<string, number>) {
  const values = [...counts.values()].filter((v) => v > 0);
  const maxCount = values.length > 0 ? Math.max(...values) : 1;
  return d3
    .scaleSequential()
    .domain([0, maxCount])
    .interpolator((t) => {
      if (t <= 0.5) {
        return d3.interpolateRgb("#5eb8e8", "#009de1")(t * 2);
      }
      return d3.interpolateRgb("#009de1", "#223582")((t - 0.5) * 2);
    });
}

export function fillForFeature(
  d: LadFeature,
  counts: Map<string, number>,
  color: d3.ScaleSequential<string, never>,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null,
  isFocused: boolean
): string {
  const name = d.properties?.geo_name ?? "";
  const isSelected = name === selectedDistrict;
  const inScope = !scopeSet || scopeSet.has(name);

  if (!inScope) return OUT_OF_SCOPE_FILL;
  if (isSelected) {
    const count = counts.get(name) ?? 0;
    return count > 0 ? color(count) : SELECTED_FILL_FALLBACK;
  }
  if (isFocused && inScope) {
    const count = counts.get(name) ?? 0;
    if (count > 0) return color(count);
    return NO_DATA_FILL;
  }
  const count = counts.get(name) ?? 0;
  if (count > 0) return color(count);
  return NO_DATA_FILL;
}

export function strokeForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): string {
  const name = d.properties?.geo_name ?? "";
  if (name === selectedDistrict) return SELECTED_STROKE;
  const inScope = !scopeSet || scopeSet.has(name);
  return inScope ? BASE_STROKE : OUT_OF_SCOPE_STROKE;
}

export function strokeWidthForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): number {
  const name = d.properties?.geo_name ?? "";
  if (name === selectedDistrict) return 3;
  const inScope = !scopeSet || scopeSet.has(name);
  return inScope ? 0.85 : 0.5;
}

export function getFitFeatures(
  features: LadFeature[],
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): LadFeature[] {
  if (selectedDistrict) {
    const match = features.filter(
      (f) => f.properties?.geo_name === selectedDistrict
    );
    if (match.length > 0) return match;
  }
  if (scopeSet && scopeSet.size > 0 && scopeSet.size <= 8) {
    const scoped = features.filter((f) =>
      scopeSet.has(f.properties?.geo_name ?? "")
    );
    if (scoped.length > 0) return scoped;
  }
  return features;
}

export function scopeKey(
  scopeAreaNames: string[] | null,
  selectedDistrict: string | null
): string {
  return `${selectedDistrict ?? ""}|${scopeAreaNames?.join(",") ?? "all"}`;
}
