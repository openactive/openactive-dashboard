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
        region: [],
        country: [],
        publisher: [],
        organization: [],
        activity: [],
        nhs_trust: [],
      }).toString()
    ).toBe("");
  });

  it("sets a single value for each filter dimension", () => {
    expect(buildFilterParams({ district: ["E06000001"] }).get("district")).toBe(
      "E06000001"
    );
    expect(buildFilterParams({ region: ["E12000001"] }).get("region")).toBe(
      "E12000001"
    );
    expect(buildFilterParams({ country: ["E92000001"] }).get("country")).toBe(
      "E92000001"
    );
    expect(buildFilterParams({ publisher: ["Active Hartlepool"] }).get("publisher")).toBe(
      "Active Hartlepool"
    );
    expect(
      buildFilterParams({ organization: ["Lewes Leisure Trust"] }).get("organization")
    ).toBe("Lewes Leisure Trust");
    expect(buildFilterParams({ activity: ["Sports Hall"] }).get("activity")).toBe(
      "Sports Hall"
    );
    expect(buildFilterParams({ nhs_trust: ["R0A"] }).get("nhs_trust")).toBe("R0A");
  });

  it("comma-joins multiple values in one dimension", () => {
    expect(
      buildFilterParams({
        district: ["E06000001", "E06000002"],
      }).get("district")
    ).toBe("E06000001,E06000002");
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

    expect(params.get("country")).toBe("E92000001");
    expect(params.get("region")).toBe("E12000001");
    expect(params.get("district")).toBe("E06000001");
    expect(params.get("publisher")).toBe("Active Hartlepool");
    expect(params.get("organization")).toBe("Lewes Leisure Trust");
    expect(params.get("activity")).toBe("Sports Hall");
    expect(params.get("nhs_trust")).toBe("R0A");
  });

  it("omits dimensions that are undefined while keeping present ones", () => {
    const params = buildFilterParams({
      district: ["E06000001"],
      publisher: undefined,
      activity: [],
    });

    expect([...params.keys()]).toEqual(["district"]);
    expect(params.get("district")).toBe("E06000001");
  });
});
