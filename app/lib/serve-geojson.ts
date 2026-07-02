import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

/**
 * Read a GeoJSON file from `app/data` and return it as a cacheable HTTP
 * response.
 *
 * The boundary route handlers share this single implementation so the
 * Content-Type, caching headers, and error shape live in one place.
 *
 * @param filename - File name inside `app/data`, e.g. "nhs-trusts.geojson".
 * @param label - Human-readable name used in the error message on failure.
 */
export function serveGeojson(filename: string, label: string) {
  try {
    const body = readFileSync(join(process.cwd(), "app/data", filename), "utf8");

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/geo+json",
     
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: `Failed to load ${label}` },
      { status: 500 }
    );
  }
}
