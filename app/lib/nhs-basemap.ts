import type { LadCollection } from "./map-styles";

export const NHS_GEOJSON_URL = "/api/boundaries/nhs";

export interface NhsBasemap {
  // The same GeoJSON the map draws, so the file is fetched only once.
  collection: LadCollection;
  nameToCode: Map<string, string>;
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

// Fetch the NHS basemap once and reuse it for the session; the picker (name ↔
// code) and the map (geometry) share this single download. A failed load
// clears the cache so the next call retries.
export function loadNhsBasemap(): Promise<NhsBasemap> {
  if (!cache) {
    cache = fetchNhsBasemap().catch((err) => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
