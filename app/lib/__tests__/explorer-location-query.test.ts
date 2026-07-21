import { describe, expect, it } from "vitest";
import { countryRef, districtRef, regionRef } from "../area-selection";
import {
  buildFeedQualityQuery,
  buildLocationFilterQuery,
  getLocationEmptyMessage,
} from "../explorer-location-query";
import { ALL_FILTER } from "../explore-filters";
import {
  getEngland,
  HARTLEPOOL,
  MIDDLESBROUGH,
  testHierarchy,
} from "../__fixtures__";

const england = getEngland();
const northEast = england.regions.find((r) => r.label === "North East")!;

describe("buildLocationFilterQuery", () => {
  it("returns an empty query when LAD has no areas selected", () => {
    expect(
      buildLocationFilterQuery(
        { boundaryType: "lad", areas: [], nhsTrusts: ["R0A"] },
        testHierarchy,
      ),
    ).toEqual({});
  });

  it.each([
    {
      name: "country",
      areas: () => [countryRef(england.id)],
      expected: { country: ["E92000001"] },
    },
    {
      name: "region",
      areas: () => [regionRef(england.id, northEast.id)],
      expected: { region: ["E12000001"] },
    },
    {
      name: "district",
      areas: () => [districtRef(HARTLEPOOL.name)],
      expected: { district: [HARTLEPOOL.geoCode] },
    },
  ])("maps a LAD $name ref to API codes", ({ areas, expected }) => {
    expect(
      buildLocationFilterQuery(
        { boundaryType: "lad", areas: areas(), nhsTrusts: [] },
        testHierarchy,
      ),
    ).toEqual(expected);
  });

  it("includes multiple LAD code levels when mixed refs are selected", () => {
    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "lad",
          areas: [
            regionRef(england.id, northEast.id),
            districtRef("Lewes District"),
          ],
          nhsTrusts: [],
        },
        testHierarchy,
      ),
    ).toEqual({
      region: ["E12000001"],
      district: ["E06000059"],
    });
  });

  it("returns NHS trust codes and ignores areas in NHS mode", () => {
    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "nhs",
          areas: [countryRef(england.id)],
          nhsTrusts: ["R0A", "R1H"],
        },
        testHierarchy,
      ),
    ).toEqual({ nhs_trust: ["R0A", "R1H"] });
  });

  it("returns nhs_trust=all when NHS has no trusts selected", () => {
    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "nhs",
          areas: [districtRef(HARTLEPOOL.name)],
          nhsTrusts: [],
        },
        testHierarchy,
      ),
    ).toEqual({ nhs_trust: [ALL_FILTER] });
  });
});

describe("buildFeedQualityQuery", () => {
  it("adds publisher, organization, and activity on top of location", () => {
    expect(
      buildFeedQualityQuery(
        {
          boundaryType: "lad",
          areas: [districtRef(HARTLEPOOL.name)],
          nhsTrusts: [],
          publisher: ["Active Hartlepool"],
          organization: ["Lewes Leisure Trust"],
          activity: ["Sports Hall"],
        },
        testHierarchy,
      ),
    ).toEqual({
      district: [HARTLEPOOL.geoCode],
      publisher: ["Active Hartlepool"],
      organization: ["Lewes Leisure Trust"],
      activity: ["Sports Hall"],
    });
  });

  it("omits empty non-location dimensions", () => {
    expect(
      buildFeedQualityQuery(
        {
          boundaryType: "lad",
          areas: [districtRef(MIDDLESBROUGH.name)],
          nhsTrusts: [],
          publisher: [],
          organization: [],
          activity: [],
        },
        testHierarchy,
      ),
    ).toEqual({ district: [MIDDLESBROUGH.geoCode] });
  });

  it("uses NHS location when boundaryType is nhs", () => {
    expect(
      buildFeedQualityQuery(
        {
          boundaryType: "nhs",
          areas: [],
          nhsTrusts: ["R0A"],
          publisher: ["NHS Example"],
          organization: [],
          activity: [],
        },
        testHierarchy,
      ),
    ).toEqual({
      nhs_trust: ["R0A"],
      publisher: ["NHS Example"],
    });
  });

  it("uses nhs_trust=all for NHS mode with no specific trusts", () => {
    expect(
      buildFeedQualityQuery(
        {
          boundaryType: "nhs",
          areas: [],
          nhsTrusts: [],
          publisher: [],
          organization: [],
          activity: [],
        },
        testHierarchy,
      ),
    ).toEqual({ nhs_trust: [ALL_FILTER] });
  });
});

describe("getLocationEmptyMessage", () => {
  const emptyLad = {
    boundaryType: "lad" as const,
    areas: [] as string[],
    nhsTrusts: [] as string[],
  };

  it.each([
    ["publishers", "No publishers found"],
    ["organizations", "No providers found"],
    ["activities", "No activities found"],
  ] as const)("uses the %s noun when nothing is selected", (item, message) => {
    expect(getLocationEmptyMessage(emptyLad, testHierarchy, item)).toBe(
      message,
    );
  });

  it("names a single LAD selection in the message", () => {
    expect(
      getLocationEmptyMessage(
        {
          boundaryType: "lad",
          areas: [districtRef(HARTLEPOOL.name)],
          nhsTrusts: [],
        },
        testHierarchy,
        "publishers",
      ),
    ).toBe("No publishers in Hartlepool");
  });

  it("uses a generic phrase for multiple LAD selections", () => {
    expect(
      getLocationEmptyMessage(
        {
          boundaryType: "lad",
          areas: [
            districtRef(HARTLEPOOL.name),
            districtRef(MIDDLESBROUGH.name),
          ],
          nhsTrusts: [],
        },
        testHierarchy,
        "activities",
      ),
    ).toBe("No activities in the selected areas");
  });

  it.each([
    {
      nhsTrusts: [] as string[],
      item: "publishers" as const,
      message: "No publishers found",
    },
    {
      nhsTrusts: ["R0A"],
      item: "organizations" as const,
      message: "No providers in the selected NHS Trust",
    },
    {
      nhsTrusts: ["R0A", "R1H"],
      item: "activities" as const,
      message: "No activities in the selected NHS Trusts",
    },
  ])("describes NHS selection ($message)", ({ nhsTrusts, item, message }) => {
    expect(
      getLocationEmptyMessage(
        { boundaryType: "nhs", areas: [], nhsTrusts },
        testHierarchy,
        item,
      ),
    ).toBe(message);
  });
});
