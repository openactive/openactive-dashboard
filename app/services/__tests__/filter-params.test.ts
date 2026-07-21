import { describe, expect, it } from "vitest";
import { buildFilterParams } from "../filter-params";

describe("buildFilterParams", () => {
  it("returns empty params for an empty query", () => {
    expect(buildFilterParams({}).toString()).toBe("");
  });

  it("omits empty arrays", () => {
    expect(
      buildFilterParams({
        district: [],
        publisher: [],
      }).toString(),
    ).toBe("");
  });

  it.each([
    ["district", ["E06000001"], "E06000001"],
    ["region", ["E12000001"], "E12000001"],
    ["country", ["E92000001"], "E92000001"],
    ["publisher", ["Active Hartlepool"], "Active Hartlepool"],
    ["organization", ["Lewes Leisure Trust"], "Lewes Leisure Trust"],
    ["activity", ["Sports Hall"], "Sports Hall"],
    ["nhs_trust", ["R0A"], "R0A"],
  ] as const)("sets %s from a single value", (key, values, expected) => {
    expect(buildFilterParams({ [key]: values }).get(key)).toBe(expected);
  });

  it("comma-joins multiple values in one dimension", () => {
    expect(
      buildFilterParams({
        district: ["E06000001", "E06000002"],
      }).get("district"),
    ).toBe("E06000001,E06000002");
  });

  it("serializes nhs_trust=all for the all-trusts sentinel", () => {
    expect(buildFilterParams({ nhs_trust: ["all"] }).get("nhs_trust")).toBe(
      "all",
    );
  });

  it("combines multiple dimensions into one query string", () => {
    const params = buildFilterParams({
      country: ["E92000001"],
      region: ["E12000001"],
      district: ["E06000001"],
      publisher: ["Active Hartlepool"],
      organization: ["Lewes Leisure Trust"],
      activity: ["Sports Hall"],
      nhs_trust: ["R0A"],
    });

    expect(Object.fromEntries(params)).toEqual({
      country: "E92000001",
      region: "E12000001",
      district: "E06000001",
      publisher: "Active Hartlepool",
      organization: "Lewes Leisure Trust",
      activity: "Sports Hall",
      nhs_trust: "R0A",
    });
  });

  it("keeps present dimensions and omits undefined or empty ones", () => {
    expect([
      ...buildFilterParams({
        district: ["E06000001"],
        publisher: undefined,
        activity: [],
      }).keys(),
    ]).toEqual(["district"]);
  });
});
