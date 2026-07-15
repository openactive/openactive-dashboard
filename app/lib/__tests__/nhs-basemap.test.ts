import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sampleCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [] },
      properties: {
        geo_name: "Manchester University NHS Foundation Trust",
        geo_code: "R0A",
        geo_type: "nhs",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [] },
      properties: {
        geo_name: "Barts Health NHS Trust",
        geo_code: "R1H",
        geo_type: "nhs",
      },
    },
  ],
};

function mockFetchSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleCollection,
    }),
  );
}

describe("loadNhsBasemap", () => {
  let loadNhsBasemap: typeof import("../nhs-basemap").loadNhsBasemap;
  let NHS_GEOJSON_URL: typeof import("../nhs-basemap").NHS_GEOJSON_URL;

  beforeEach(async () => {
    vi.resetModules();
    ({ loadNhsBasemap, NHS_GEOJSON_URL } = await import("../nhs-basemap"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads GeoJSON and builds name and code lookup maps", async () => {
    mockFetchSuccess();

    const basemap = await loadNhsBasemap();

    expect(fetch).toHaveBeenCalledWith(NHS_GEOJSON_URL);
    expect(basemap.collection).toEqual(sampleCollection);
    expect(
      basemap.nameToCode.get("Manchester University NHS Foundation Trust"),
    ).toBe("R0A");
    expect(basemap.codeToName.get("R1H")).toBe("Barts Health NHS Trust");
  });

  it("reuses the cached result on a second call", async () => {
    mockFetchSuccess();

    await loadNhsBasemap();
    await loadNhsBasemap();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("clears the cache after a failed load so the next call retries", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValue({
          ok: true,
          json: async () => sampleCollection,
        }),
    );

    await expect(loadNhsBasemap()).rejects.toThrow(
      "Failed to load NHS basemap (500",
    );

    const basemap = await loadNhsBasemap();

    expect(basemap.codeToName.get("R0A")).toBe(
      "Manchester University NHS Foundation Trust",
    );
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
