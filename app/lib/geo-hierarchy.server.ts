import { readFileSync } from "fs";
import { join } from "path";
import { buildGeoHierarchy, type GeoHierarchy } from "./geo-hierarchy";

/** Load hierarchy from app/data/combined-boundaries.geojson (server only). */
const FILE_PATH = join(
  process.cwd(),
  "app/data/combined-boundaries.geojson"
);

let cachedHierarchy: GeoHierarchy | null = null;

export function loadGeoHierarchy(): GeoHierarchy {
  if (cachedHierarchy) return cachedHierarchy;

  const geojson = JSON.parse(readFileSync(FILE_PATH, "utf8"));
  cachedHierarchy = buildGeoHierarchy(geojson);
  return cachedHierarchy;
}
