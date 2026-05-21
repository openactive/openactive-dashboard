import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

/** Serve combined-boundaries.geojson from app/data (single source of truth). */
export async function GET() {
  const filePath = join(
    process.cwd(),
    "app/data/combined-boundaries.geojson"
  );

  const body = readFileSync(filePath, "utf8");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/geo+json",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
