import * as d3 from "d3";

export const GEOJSON_URL = "/api/boundaries";

export const LAND_FILL = "#dce4ec";
export const LAND_STROKE = "#a8b8c8";
export const FOCUS_STROKE = "#e21483";

const BASE_STROKE = "#8fa3b8";
const OUT_OF_SCOPE_FILL = "#e8edf2";
const OUT_OF_SCOPE_STROKE = "#c5ced8";
const NO_DATA_FILL = "#fff";
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

function resolveFeatureState(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
) {
  const name = d.properties?.geo_name ?? "";
  const isSelected = name === selectedDistrict;
  const inScope = !scopeSet || scopeSet.has(name);
  return { name, isSelected, inScope };
}

export const LEGEND_FROM = "#cfe7f7";
export const LEGEND_TO = "#1a2a6b";

export function buildColorScale(counts: Map<string, number>) {
  const values = [...counts.values()].filter((v) => v > 0);
  const maxCount = values.length > 0 ? Math.max(...values) : 1;
  return d3
    .scaleSequential()
    .domain([0, maxCount])
    .interpolator(d3.interpolateRgb(LEGEND_FROM, LEGEND_TO));
}

export function fillForFeature(
  d: LadFeature,
  counts: Map<string, number>,
  color: d3.ScaleSequential<string, never>,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null,
  isFocused: boolean
): string {
  const { name, isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedDistrict
  );

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
  const { isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedDistrict
  );
  if (isSelected) return SELECTED_STROKE;
  return inScope ? BASE_STROKE : OUT_OF_SCOPE_STROKE;
}

export function strokeWidthForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): number {
  const { isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedDistrict
  );
  if (isSelected) return 3;
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

/**
 * Translate extent that constrains panning to the projected map shapes
 * (with a small margin) rather than the whole SVG viewport — so zoomed-in
 * users can't drag the map off into the grey background.
 */
export function computeTranslateExtent(
  path: d3.GeoPath,
  collection: { type: "FeatureCollection"; features: LadFeature[] },
  width: number,
  height: number
): [[number, number], [number, number]] {
  const bounds = path.bounds(collection as d3.GeoPermissibleObjects);
  const [[x0, y0], [x1, y1]] = bounds;
  if (!Number.isFinite(x0) || !Number.isFinite(y0)) {
    return [[0, 0], [width, height]];
  }
  const margin = 24;
  return [
    [x0 - margin, y0 - margin],
    [x1 + margin, y1 + margin],
  ];
}
