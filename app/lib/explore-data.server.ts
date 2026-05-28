import { readFile } from "fs/promises";
import { join } from "path";
import { parseExplorerCsv, type CrossTabRow } from "./explore-csv";
import { loadGeoHierarchy } from "./geo-hierarchy.server";
import type { GeoHierarchy } from "./geo-hierarchy";

const GEOCODED_CSV_PATH = join(
  process.cwd(),
  "app/data/newdata-geocoded.csv"
);

function enrichRowsWithGeoNames(
  rows: CrossTabRow[],
  hierarchy: GeoHierarchy
): CrossTabRow[] {
  const codeToName = new Map<string, string>();

  for (const country of hierarchy.countries) {
    for (const region of country.regions) {
      for (const area of region.areas) {
        codeToName.set(area.geoCode, area.name);
      }
    }
  }

  return rows.map((row) => {
    if (!row.geoCode) return row;
    const name = codeToName.get(row.geoCode);
    return name ? { ...row, district: name } : row;
  });
}

/** Load geocoded cross-tab data and join geo codes to boundary names. */
export async function loadExplorerData(): Promise<{
  rows: CrossTabRow[];
  hierarchy: GeoHierarchy;
}> {
  const content = await readFile(GEOCODED_CSV_PATH, "utf8");
  const hierarchy = loadGeoHierarchy();
  const rows = enrichRowsWithGeoNames(parseExplorerCsv(content), hierarchy);
  return { rows, hierarchy };
}
