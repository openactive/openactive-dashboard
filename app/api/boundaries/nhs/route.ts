import { serveGeojson } from "../../../lib/serve-geojson";

/** GET /api/boundaries/nhs — NHS Trust boundaries. */
export function GET() {
  return serveGeojson("nhs-trusts.geojson", "NHS trust boundaries data");
}
