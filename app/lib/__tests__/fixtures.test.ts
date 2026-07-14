import { describe, expect, it } from "vitest";
import {
  findDistrictByCode,
  findDistrictByName,
  getEngland,
  getScotland,
  HARTLEPOOL,
  HIGHLAND,
  LEWES,
  sampleFeedQualityRows,
  sampleLadOpportunities,
  sampleNhsOpportunities,
  sampleOpportunities,
  testHierarchy,
} from "../__fixtures__";

describe("test fixtures", () => {
  it("builds England with regions and flat Scotland", () => {
    expect(testHierarchy.countries.map((c) => c.label)).toEqual([
      "England",
      "Scotland",
    ]);

    expect(getEngland().regions.map((r) => r.label)).toEqual([
      "North East",
      "South East",
    ]);

    expect(getScotland().regions).toHaveLength(1);
    expect(getScotland().regions[0]?.label).toBe("Scotland");
  });

  it("exposes named districts for area-selection and map tests", () => {
    expect(findDistrictByName(testHierarchy, HARTLEPOOL.name)?.geoCode).toBe(
      HARTLEPOOL.geoCode
    );
    expect(findDistrictByName(testHierarchy, LEWES.hierarchyName)?.geoCode).toBe(
      LEWES.geoCode
    );
    expect(findDistrictByCode(testHierarchy, LEWES.geoCode)?.name).toBe(
      LEWES.hierarchyName
    );
    expect(findDistrictByName(testHierarchy, HIGHLAND.name)?.geoCode).toBe(
      HIGHLAND.geoCode
    );
  });

  it("provides opportunity and feed-quality sample payloads", () => {
    expect(sampleLadOpportunities.length).toBeGreaterThan(0);
    expect(sampleNhsOpportunities.length).toBeGreaterThan(0);
    expect(sampleOpportunities.length).toBe(
      sampleLadOpportunities.length + sampleNhsOpportunities.length
    );
    expect(sampleFeedQualityRows.some((row) => row.status === "ERROR")).toBe(
      true
    );
  });
});
