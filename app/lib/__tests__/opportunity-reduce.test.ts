import { describe, expect, it } from "vitest";
import type { Opportunity } from "../../types/opportunities";
import { rankTop, reduceOpportunities } from "../opportunity-reduce";
import {
  sampleLadOpportunities,
  sampleNhsOpportunities,
} from "../__fixtures__";

describe("rankTop", () => {
  it("sorts highest counts first and keeps only the limit", () => {
    const map = new Map([
      ["a", 1],
      ["b", 5],
      ["c", 3],
    ]);
    expect(rankTop(map, 2)).toEqual([
      { name: "b", count: 5 },
      { name: "c", count: 3 },
    ]);
  });
});

describe("reduceOpportunities", () => {
  it("totals opportunities and splits activity vs facility counts", () => {
    const { summary } = reduceOpportunities(sampleLadOpportunities, "lad");

    expect(summary.totalOpportunities).toBe(67);
    expect(summary.activityOpportunities).toBe(49);
    expect(summary.facilityOpportunities).toBe(18);
  });

  it("keys the choropleth by district name in local authority mode", () => {
    const { districtCounts, summary } = reduceOpportunities(
      sampleLadOpportunities,
      "lad"
    );

    expect(districtCounts[0]).toEqual({ district: "Hartlepool", count: 42 });
    expect(summary.areaCount).toBe(3);
    expect(summary.topAreas[0]?.name).toBe("Hartlepool");
  });

  it("keys the choropleth by trust code in NHS mode", () => {
    const { districtCounts, summary } = reduceOpportunities(
      sampleNhsOpportunities,
      "nhs"
    );

    expect(districtCounts).toEqual([
      { district: "R0A", count: 25 },
      { district: "R1H", count: 10 },
    ]);
    expect(summary.areaCount).toBe(2);
    expect(summary.topAreas[0]?.name).toBe(
      "Manchester University NHS Foundation Trust"
    );
  });

  it("reads organization and activity names from JSON arrays", () => {
    const { summary, presentNames } = reduceOpportunities(
      sampleLadOpportunities,
      "lad"
    );

    expect(summary.organizationCount).toBe(2);
    expect(summary.activityCount).toBe(1);
    expect(presentNames.organizations.has("Lewes Leisure Trust")).toBe(true);
    expect(presentNames.activities.has("Sports Hall")).toBe(true);
  });

  it("ignores blank strings inside organization JSON arrays", () => {
    const rows: Opportunity[] = [
      {
        ...sampleLadOpportunities[0]!,
        organization_names: '[" ", "Valid Org"]',
        activity_or_facility: "[]",
      },
    ];
    const { presentNames } = reduceOpportunities(rows, "lad");
    expect([...presentNames.organizations]).toEqual(["Valid Org"]);
  });
});
