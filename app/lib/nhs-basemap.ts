import type { LadCollection } from "./map-styles";

/** Route serving the WGS84 NHS Trust boundaries */
export const NHS_GEOJSON_URL = "/api/boundaries/nhs";

export interface NhsBasemap {
  /** The raw GeoJSON, reused by the map (single fetch, shared). */
  collection: LadCollection;
  /** Trust name → trust code, e.g. "Manchester University NHS Foundation Trust" → "R0A". */
  nameToCode: Map<string, string>;
  /** Trust code → trust name. */
  codeToName: Map<string, string>;
}

let cache: Promise<NhsBasemap> | null = null;

async function fetchNhsBasemap(): Promise<NhsBasemap> {
  const res = await fetch(NHS_GEOJSON_URL);
  if (!res.ok) throw new Error(`Failed to load NHS basemap (${res.status})`);

  const collection = (await res.json()) as LadCollection;

  const nameToCode = new Map<string, string>();
  const codeToName = new Map<string, string>();
  for (const feature of collection.features) {
    const name = feature.properties?.geo_name;
    const code = feature.properties?.geo_code;
    if (name && code) {
      nameToCode.set(name, code);
      codeToName.set(code, name);
    }
  }

  return { collection, nameToCode, codeToName };
}

/**
 * Fetch the NHS Trust basemap once and cache the result for the session.
 *
 * Both the area picker (name ↔ code lookup) and the map (geometry) call this,
 * so the GeoJSON file is downloaded a single time. A failed load clears the
 * cache so the next call can retry.
 */
export function loadNhsBasemap(): Promise<NhsBasemap> {
  if (!cache) {
    cache = fetchNhsBasemap().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
