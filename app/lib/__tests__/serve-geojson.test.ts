import { beforeEach, describe, expect, it, vi } from "vitest";
import { join } from "path";
import { readFileSync } from "fs";
import { serveGeojson } from "../serve-geojson";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

const mockedReadFileSync = vi.mocked(readFileSync);

describe("serveGeojson", () => {
  beforeEach(() => {
    mockedReadFileSync.mockReset();
  });

  it("returns GeoJSON with the right headers when the file exists", async () => {
    mockedReadFileSync.mockReturnValue('{"type": "FeatureCollection" }');

    const response = serveGeojson("nhs-trusts.geojson", "NHS trusts");

    expect(mockedReadFileSync).toHaveBeenCalledWith(
      join(process.cwd(), "app/data", "nhs-trusts.geojson"),
      "utf8",
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/geo+json");
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, stale-while-revalidate=86400",
    );
    expect(await response.text()).toBe('{"type": "FeatureCollection" }');
  });

  it("returns a 500 JSON error when the file cannot be read", async () => {
    mockedReadFileSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });

    const response = serveGeojson("missing.geojson", "NHS trusts");

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to load NHS trusts",
    });
  });
});
