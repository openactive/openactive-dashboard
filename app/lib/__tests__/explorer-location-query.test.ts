import { describe, expect, it } from "vitest";
import {
  countryRef,
  districtRef,
  regionRef,
} from "../area-selection";
import {
  buildFeedQualityQuery,
  buildLocationFilterQuery,
  getLocationEmptyMessage,
} from "../explorer-location-query";
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
        testHierarchy
      )
    ).toEqual({});
  });

  it("maps LAD country, region, and district refs to API code arrays", () => {
    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "lad",
          areas: [countryRef(england.id)],
          nhsTrusts: [],
        },
        testHierarchy
      )
    ).toEqual({ country: ["E92000001"] });

    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "lad",
          areas: [regionRef(england.id, northEast.id)],
          nhsTrusts: [],
        },
        testHierarchy
      )
    ).toEqual({ region: ["E12000001"] });

    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "lad",
          areas: [districtRef(HARTLEPOOL.name)],
          nhsTrusts: [],
        },
        testHierarchy
      )
    ).toEqual({ district: [HARTLEPOOL.geoCode] });
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
        testHierarchy
      )
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
        testHierarchy
      )
    ).toEqual({ nhs_trust: ["R0A", "R1H"] });
  });

  it("returns an empty query when NHS has no trusts selected", () => {
    expect(
      buildLocationFilterQuery(
        {
          boundaryType: "nhs",
          areas: [districtRef(HARTLEPOOL.name)],
          nhsTrusts: [],
        },
        testHierarchy
      )
    ).toEqual({});
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
        testHierarchy
      )
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
        testHierarchy
      )
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
        testHierarchy
      )
    ).toEqual({
      nhs_trust: ["R0A"],
      publisher: ["NHS Example"],
    });
  });
});

describe("getLocationEmptyMessage", () => {
  it("uses the correct noun for publishers, providers, and activities", () => {
    const emptyLad = {
      boundaryType: "lad" as const,
      areas: [] as string[],
      nhsTrusts: [] as string[],
    };

    expect(getLocationEmptyMessage(emptyLad, testHierarchy, "publishers")).toBe(
      "No publishers found"
    );
    expect(
      getLocationEmptyMessage(emptyLad, testHierarchy, "organizations")
    ).toBe("No providers found");
    expect(getLocationEmptyMessage(emptyLad, testHierarchy, "activities")).toBe(
      "No activities found"
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
        "publishers"
      )
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
        "activities"
      )
    ).toBe("No activities in the selected areas");
  });

  it("describes empty and selected NHS trust cases", () => {
    expect(
      getLocationEmptyMessage(
        { boundaryType: "nhs", areas: [], nhsTrusts: [] },
        testHierarchy,
        "publishers"
      )
    ).toBe("No publishers found");

    expect(
      getLocationEmptyMessage(
        { boundaryType: "nhs", areas: [], nhsTrusts: ["R0A"] },
        testHierarchy,
        "organizations"
      )
    ).toBe("No providers in the selected NHS Trust");

    expect(
      getLocationEmptyMessage(
        { boundaryType: "nhs", areas: [], nhsTrusts: ["R0A", "R1H"] },
        testHierarchy,
        "activities"
      )
    ).toBe("No activities in the selected NHS Trusts");
  });
});
