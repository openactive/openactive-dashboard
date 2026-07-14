import { describe, expect, it } from "vitest";
import { areaMetricLabel, boundaryNoun } from "../explore-filters";

describe("areaMetricLabel", () => {
  it.each([
    ["lad", "full", "Local areas"],
    ["lad", "short", "Areas"],
    ["nhs", "full", "NHS Trusts"],
    ["nhs", "short", "Trusts"],
  ] as const)("returns %s / %s as %s", (boundaryType, variant, label) => {
    expect(areaMetricLabel(boundaryType, variant)).toBe(label);
  });

  it("defaults to the full local-authority label", () => {
    expect(areaMetricLabel("lad")).toBe("Local areas");
  });
});

describe("boundaryNoun", () => {
  it.each([
    ["lad", false, "local authority"],
    ["lad", true, "local authorities"],
    ["nhs", false, "NHS Trust"],
    ["nhs", true, "NHS Trusts"],
  ] as const)("returns %s / plural=%s as %s", (boundaryType, plural, noun) => {
    expect(boundaryNoun(boundaryType, plural)).toBe(noun);
  });

  it("defaults to the singular local-authority noun", () => {
    expect(boundaryNoun("lad")).toBe("local authority");
  });
});
