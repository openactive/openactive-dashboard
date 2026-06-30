import { serveGeojson } from "../../../lib/serve-geojson";

/** GET /api/boundaries/local-authority — Local Authority District boundaries. */
export function GET() {
  return serveGeojson("combined-boundaries.geojson", "boundaries data");
}
