import * as d3 from "d3";

export const GEOJSON_URL = "/api/boundaries/local-authority";

export const LAND_FILL = "#dce4ec";
export const LAND_STROKE = "#a8b8c8";
export const FOCUS_STROKE = "#e21483";

const BASE_STROKE = "#8fa3b8";
const OUT_OF_SCOPE_FILL = "#e8edf2";
const OUT_OF_SCOPE_STROKE = "#c5ced8";
const NO_DATA_FILL = "#fff";
const SELECTED_STROKE = "#223582";
const SELECTED_FILL_FALLBACK = "#009de1";

interface GeoProperties {
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

// Local Authority features join the opportunity data by name; NHS Trust
// features join by code. The colour/outline helpers take which key to read,
// defaulting to name so Local Authority callers stay unchanged.
export type FeatureJoinKey = "geo_name" | "geo_code";

function featureKey(d: LadFeature, joinKey: FeatureJoinKey): string {
  return d.properties?.[joinKey] ?? "";
}

function resolveFeatureState(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedKey: string | null,
  joinKey: FeatureJoinKey
) {
  const key = featureKey(d, joinKey);
  const isSelected = key === selectedKey;
  const inScope = !scopeSet || scopeSet.has(key);
  return { key, isSelected, inScope };
}

export const LEGEND_FROM = "#F6EDE0";
export const LEGEND_TO = "#952082";

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
  selectedKey: string | null,
  isFocused: boolean,
  joinKey: FeatureJoinKey = "geo_name"
): string {
  const { key, isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedKey,
    joinKey
  );

  if (!inScope) return OUT_OF_SCOPE_FILL;
  if (isSelected) {
    const count = counts.get(key) ?? 0;
    return count > 0 ? color(count) : SELECTED_FILL_FALLBACK;
  }
  if (isFocused && inScope) {
    const count = counts.get(key) ?? 0;
    if (count > 0) return color(count);
    return NO_DATA_FILL;
  }
  const count = counts.get(key) ?? 0;
  if (count > 0) return color(count);
  return NO_DATA_FILL;
}

export function strokeForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedKey: string | null,
  joinKey: FeatureJoinKey = "geo_name"
): string {
  const { isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedKey,
    joinKey
  );
  if (isSelected) return SELECTED_STROKE;
  return inScope ? BASE_STROKE : OUT_OF_SCOPE_STROKE;
}

export function strokeWidthForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedKey: string | null,
  joinKey: FeatureJoinKey = "geo_name"
): number {
  const { isSelected, inScope } = resolveFeatureState(
    d,
    scopeSet,
    selectedKey,
    joinKey
  );
  if (isSelected) return 3;
  return inScope ? 0.85 : 0.5;
}

export function getFitFeatures(
  features: LadFeature[],
  counts: Map<string, number>,
  joinKey: FeatureJoinKey = "geo_name",
): LadFeature[] {
  const dataKeys = new Set(
    [...counts.entries()]
      .filter(([, c]) => c > 0)
      .map(([key]) => key),
  );
  
  if (dataKeys.size > 0 && dataKeys.size < features.length) {
    const matched = features.filter((f) =>
      dataKeys.has(featureKey(f, joinKey)),
    );
    if (matched.length > 0) return matched;
  }
  return features;
}

export function scopeKey(
  counts: Map<string, number>,
): string {
  const names = [...counts.entries()]
    .filter(([, c]) => c > 0)
    .map(([name]) => name)
    .sort();
  return names.join(",") || "all";
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
