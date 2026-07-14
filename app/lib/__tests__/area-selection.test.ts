import { describe, expect, it } from "vitest";
import {
  countryRef,
  districtRef,
  expandRefsToDistrictNames,
  getAreaSelectionLabel,
  getCountryCheckState,
  getNhsTrustLabel,
  getRegionCheckState,
  getSelectedDistrictNames,
  isDistrictSelected,
  minimizeDistrictsToRefs,
  partitionAreaRefsToCodes,
  regionRef,
  resolveDistrictNameFromMap,
  setCountrySelected,
  setDistrictSelected,
  setRegionSelected,
} from "../area-selection";
import {
  getEngland,
  getScotland,
  HARTLEPOOL,
  HIGHLAND,
  LEWES,
  MIDDLESBROUGH,
  sampleNhsTrustOptions,
  testHierarchy,
} from "../__fixtures__";

describe("area-selection ref helpers", () => {
  it.each([
    ["country", countryRef("england"), "country:england"],
    ["region", regionRef("england", "north-east"), "region:england:north-east"],
    ["district", districtRef("Hartlepool"), "district:Hartlepool"],
  ] as const)("builds a stable %s ref string", (_kind, actual, expected) => {
    expect(actual).toBe(expected);
  });
});

describe("expandRefsToDistrictNames", () => {
  const england = getEngland();

  it("returns an empty set for no refs", () => {
    expect(expandRefsToDistrictNames([], testHierarchy).size).toBe(0);
  });

  it("expands a district ref to one name", () => {
    expect(expandRefsToDistrictNames([districtRef(HARTLEPOOL.name)], testHierarchy)).toEqual(
      new Set([HARTLEPOOL.name])
    );
  });

  it("expands a region ref to its districts", () => {
    const northEast = england.regions.find((r) => r.label === "North East");
    expect(northEast).toBeDefined();

    const covered = expandRefsToDistrictNames(
      [regionRef(england.id, northEast!.id)],
      testHierarchy
    );
    expect(covered).toEqual(new Set([HARTLEPOOL.name, MIDDLESBROUGH.name]));
  });

  it("expands a country ref to all districts in that country", () => {
    const covered = expandRefsToDistrictNames([countryRef(england.id)], testHierarchy);
    expect(covered).toEqual(
      new Set([HARTLEPOOL.name, MIDDLESBROUGH.name, LEWES.hierarchyName])
    );
  });

  it("ignores invalid refs", () => {
    expect(expandRefsToDistrictNames(["not-a-ref"], testHierarchy).size).toBe(0);
  });
});

describe("minimizeDistrictsToRefs", () => {
  const england = getEngland();
  const scotland = getScotland();
  const northEast = england.regions.find((r) => r.label === "North East")!;
  const southEast = england.regions.find((r) => r.label === "South East")!;

  it("minimizes a partial region to district refs", () => {
    expect(minimizeDistrictsToRefs(new Set([HARTLEPOOL.name]), testHierarchy)).toEqual([
      districtRef(HARTLEPOOL.name),
    ]);
  });

  it("minimizes a full region to a region ref", () => {
    expect(
      minimizeDistrictsToRefs(
        new Set([HARTLEPOOL.name, MIDDLESBROUGH.name]),
        testHierarchy
      )
    ).toEqual([regionRef(england.id, northEast.id)]);
  });

  it("minimizes a full multi-region country to a country ref", () => {
    const covered = new Set([
      HARTLEPOOL.name,
      MIDDLESBROUGH.name,
      LEWES.hierarchyName,
    ]);
    expect(minimizeDistrictsToRefs(covered, testHierarchy)).toEqual([
      countryRef(england.id),
    ]);
  });

  it("collapses a single-region country to a country ref when all districts are covered", () => {
    expect(minimizeDistrictsToRefs(new Set([HIGHLAND.name]), testHierarchy)).toEqual([
      countryRef(scotland.id),
    ]);
  });

  it("round-trips expand then minimize for canonical selections", () => {
    const cases = [
      [districtRef(HARTLEPOOL.name)],
      [regionRef(england.id, northEast.id)],
      [regionRef(england.id, southEast.id)],
      [countryRef(england.id)],
      [countryRef(scotland.id)],
    ] as const;

    for (const refs of cases) {
      const covered = expandRefsToDistrictNames([...refs], testHierarchy);
      expect(minimizeDistrictsToRefs(covered, testHierarchy)).toEqual([...refs]);
    }
  });
});

describe("setCountrySelected / setRegionSelected / setDistrictSelected", () => {
  const england = getEngland();
  const northEast = england.regions.find((r) => r.label === "North East")!;

  it("selects a single district from empty", () => {
    expect(
      setDistrictSelected([], testHierarchy, HARTLEPOOL.name, true)
    ).toEqual([districtRef(HARTLEPOOL.name)]);
  });

  it("deselects a district from a country selection", () => {
    const allEngland = [countryRef(england.id)];
    const southEast = england.regions.find((r) => r.label === "South East")!;
    expect(
      setDistrictSelected(allEngland, testHierarchy, HARTLEPOOL.name, false)
    ).toEqual([
      districtRef(MIDDLESBROUGH.name),
      regionRef(england.id, southEast.id),
    ]);
  });

  it("selects a whole region", () => {
    expect(
      setRegionSelected([], testHierarchy, england.id, northEast.id, true)
    ).toEqual([regionRef(england.id, northEast.id)]);
  });

  it("selects a whole country", () => {
    expect(setCountrySelected([], testHierarchy, england.id, true)).toEqual([
      countryRef(england.id),
    ]);
  });

  it("returns areas unchanged for unknown country or region", () => {
    const current = [districtRef(HARTLEPOOL.name)];
    expect(setCountrySelected(current, testHierarchy, "unknown", true)).toEqual(current);
    expect(
      setRegionSelected(current, testHierarchy, england.id, "unknown", true)
    ).toEqual(current);
  });
});

describe("tri-state check helpers", () => {
  const england = getEngland();
  const northEast = england.regions.find((r) => r.label === "North East")!;

  it("reports unchecked, indeterminate, and checked country states", () => {
    const empty = expandRefsToDistrictNames([], testHierarchy);
    expect(getCountryCheckState(empty, testHierarchy, england.id)).toBe("unchecked");

    const oneDistrict = expandRefsToDistrictNames(
      [districtRef(HARTLEPOOL.name)],
      testHierarchy
    );
    expect(getCountryCheckState(oneDistrict, testHierarchy, england.id)).toBe(
      "indeterminate"
    );

    const allEngland = expandRefsToDistrictNames([countryRef(england.id)], testHierarchy);
    expect(getCountryCheckState(allEngland, testHierarchy, england.id)).toBe("checked");
  });

  it("reports region and district selection state", () => {
    const covered = expandRefsToDistrictNames(
      [districtRef(HARTLEPOOL.name)],
      testHierarchy
    );

    expect(getRegionCheckState(covered, testHierarchy, england.id, northEast.id)).toBe(
      "indeterminate"
    );
    expect(isDistrictSelected(covered, HARTLEPOOL.name)).toBe(true);
    expect(isDistrictSelected(covered, MIDDLESBROUGH.name)).toBe(false);
  });
});

describe("partitionAreaRefsToCodes", () => {
  const england = getEngland();
  const northEast = england.regions.find((r) => r.label === "North East")!;

  it("maps country, region, and district refs to API codes", () => {
    expect(
      partitionAreaRefsToCodes(
        [
          countryRef(england.id),
          regionRef(england.id, northEast.id),
          districtRef(HARTLEPOOL.name),
        ],
        testHierarchy
      )
    ).toEqual({
      country: ["E92000001"],
      region: ["E12000001"],
      district: [HARTLEPOOL.geoCode],
    });
  });

  it("omits unknown district names from the API payload", () => {
    expect(partitionAreaRefsToCodes([districtRef("Unknown Place")], testHierarchy)).toEqual({
      country: [],
      region: [],
      district: [],
    });
  });
});

describe("getSelectedDistrictNames", () => {
  it("returns expanded district names as an array", () => {
    expect(
      getSelectedDistrictNames([districtRef(HARTLEPOOL.name)], testHierarchy)
    ).toEqual([HARTLEPOOL.name]);
  });
});

describe("getAreaSelectionLabel", () => {
  const england = getEngland();
  const northEast = england.regions.find((r) => r.label === "North East")!;

  it('returns "All areas" when nothing is selected', () => {
    expect(getAreaSelectionLabel([], testHierarchy)).toBe("All areas");
  });

  it("labels a single country, region, or district", () => {
    expect(getAreaSelectionLabel([countryRef(england.id)], testHierarchy)).toBe(
      "England"
    );
    expect(
      getAreaSelectionLabel([regionRef(england.id, northEast.id)], testHierarchy)
    ).toBe("England › North East");
    expect(
      getAreaSelectionLabel([districtRef(HARTLEPOOL.name)], testHierarchy)
    ).toBe(HARTLEPOOL.name);
  });

  it("labels multi-selections with a count", () => {
    expect(
      getAreaSelectionLabel(
        [districtRef(HARTLEPOOL.name), districtRef(LEWES.hierarchyName)],
        testHierarchy
      )
    ).toBe("2 areas selected");
  });
});

describe("getNhsTrustLabel", () => {
  it.each([
    [[], "All NHS Trusts"],
    [["R0A"], "Manchester University NHS Foundation Trust"],
    [["ZZZ"], "1 Trust"],
    [["R0A", "R1H"], "2 Trusts"],
  ] as const)("labels %j as %s", (codes, label) => {
    expect(getNhsTrustLabel([...codes], sampleNhsTrustOptions)).toBe(label);
  });
});

describe("resolveDistrictNameFromMap", () => {
  it("matches by hierarchy name when the basemap label is the same", () => {
    expect(resolveDistrictNameFromMap(testHierarchy, HARTLEPOOL.name)).toBe(
      HARTLEPOOL.name
    );
  });

  it("falls back to geo_code when the basemap label differs from hierarchy name", () => {
    expect(
      resolveDistrictNameFromMap(testHierarchy, LEWES.mapName, LEWES.geoCode)
    ).toBe(LEWES.hierarchyName);
  });

  it("returns null when neither name nor code matches", () => {
    expect(resolveDistrictNameFromMap(testHierarchy, "Nowhere", "X00000000")).toBe(
      null
    );
  });
});
