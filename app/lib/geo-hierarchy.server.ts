import { getAllAreas } from "../services/areas";
import { transformAreasToHierarchy } from "./areas-to-hierarchy";
import type { GeoHierarchy } from "./geo-hierarchy";

let cachedHierarchy: GeoHierarchy | null = null;

function isValidHierarchy(value: unknown): value is GeoHierarchy {
  return (
    typeof value === "object" &&
    value !== null &&
    "countries" in value &&
    Array.isArray((value as GeoHierarchy).countries)
  );
}

/**
 * Load location hierarchy from the /areas API endpoint.
 * Caches at module level to avoid repeated network calls within
 * the same server process.
 */
export async function loadGeoHierarchy(): Promise<GeoHierarchy> {
  if (isValidHierarchy(cachedHierarchy)) {
    return cachedHierarchy;
  }

  cachedHierarchy = null;

  const raw = await getAllAreas();
  cachedHierarchy = transformAreasToHierarchy(raw);
  return cachedHierarchy;
}
