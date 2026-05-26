import { readFileSync } from "fs";
import { join } from "path";
import { buildGeoHierarchy, type GeoHierarchy } from "./geo-hierarchy";

/** Load hierarchy from app/data/combined-boundaries.geojson (server only). */
export function loadGeoHierarchy(): GeoHierarchy {
  const filePath = join(
    process.cwd(),
    "app/data/combined-boundaries.geojson"
  );
  const geojson = JSON.parse(readFileSync(filePath, "utf8"));
  return buildGeoHierarchy(geojson);
}
