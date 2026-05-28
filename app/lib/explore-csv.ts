/**
 * Cross-tab opportunity row from newdata-geocoded.csv.
 * `geoCode` matches combined-boundaries `geo_code`; `district` is the resolved `geo_name`.
 */
export type CrossTabRow = {
  geoCode: string;
  district: string;
  publisher: string;
  activity: string;
  count: number;
};

/** Parse a single CSV line, respecting quoted fields */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  fields.push(current.trim());
  return fields;
}

/** Parse geocode,publisher,activity_or_facility,row_count */
export function parseExplorerCsv(content: string): CrossTabRow[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const rows: CrossTabRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const [geoCode, publisher, activity, countStr] = parseCsvLine(line);
    const count = Number.parseInt(countStr, 10);
    if (Number.isNaN(count) || count < 0) continue;

    rows.push({
      geoCode: geoCode ?? "",
      district: "",
      publisher: publisher ?? "",
      activity: activity ?? "",
      count,
    });
  }

  return rows;
}
