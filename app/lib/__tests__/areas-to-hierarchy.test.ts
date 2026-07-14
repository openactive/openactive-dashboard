import { describe, expect, it } from "vitest";
import type { AreasResponse } from "../../types/areas";
import { transformAreasToHierarchy } from "../areas-to-hierarchy";
import { sampleAreasResponse } from "../__fixtures__";

describe("transformAreasToHierarchy", () => {
  it("returns an empty countries list for an empty response", () => {
    expect(transformAreasToHierarchy({})).toEqual({ countries: [] });
  });

  it("sorts countries alphabetically by label", () => {
    const hierarchy = transformAreasToHierarchy(sampleAreasResponse);
    expect(hierarchy.countries.map((c) => c.label)).toEqual([
      "England",
      "Scotland",
    ]);
  });

  it("builds England with stable lowercase ids, codes, and regions/districts in A–Z order", () => {
    const england = transformAreasToHierarchy(sampleAreasResponse).countries.find(
      (c) => c.label === "England"
    );

    expect(england).toMatchObject({
      id: "england",
      code: "E92000001",
      label: "England",
    });
    expect(england?.regions.map((r) => r.label)).toEqual([
      "North East",
      "South East",
    ]);

    const northEast = england?.regions[0];
    expect(northEast).toMatchObject({
      id: "north-east",
      code: "E12000001",
      label: "North East",
    });
    expect(northEast?.areas).toEqual([
      { name: "Hartlepool", geoCode: "E06000001", geoType: "lad" },
      { name: "Middlesbrough", geoCode: "E06000002", geoType: "lad" },
    ]);
  });

  it("gives Scotland one region that reuses the country id, code, and label", () => {
    const scotland = transformAreasToHierarchy(sampleAreasResponse).countries.find(
      (c) => c.label === "Scotland"
    );

    expect(scotland).toMatchObject({
      id: "scotland",
      code: "S92000003",
      label: "Scotland",
    });
    expect(scotland?.regions).toHaveLength(1);
    expect(scotland?.regions[0]).toEqual({
      id: "scotland",
      code: "S92000003",
      label: "Scotland",
      areas: [
        { name: "Highland", geoCode: "S12000017", geoType: "lad" },
      ],
    });
  });

  it("sorts districts alphabetically within a region", () => {
    const raw: AreasResponse = {
      England: {
        country_code: "E92000001",
        regions: [
          {
            "North East": {
              region_code: "E12000001",
              districts: [
                { district_name: "Middlesbrough", district_code: "E06000002" },
                { district_name: "Hartlepool", district_code: "E06000001" },
              ],
            },
          },
        ],
      },
    };

    const areas =
      transformAreasToHierarchy(raw).countries[0]?.regions[0]?.areas ?? [];
    expect(areas.map((a) => a.name)).toEqual(["Hartlepool", "Middlesbrough"]);
  });

  it("turns country and region display names into lowercase hyphenated ids", () => {
    const raw: AreasResponse = {
      "Northern Ireland": {
        country_code: "N92000002",
        districts: [
          { district_name: "Belfast", district_code: "N09000003" },
        ],
      },
    };

    const country = transformAreasToHierarchy(raw).countries[0];
    expect(country?.id).toBe("northern-ireland");
    expect(country?.regions[0]?.id).toBe("northern-ireland");
  });
});
