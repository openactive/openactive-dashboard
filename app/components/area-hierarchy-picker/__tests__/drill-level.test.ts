import { describe, expect, it } from "vitest";
import { getBackLabel, getPanelTitle, goBackDrill } from "../drill-level";
import type { DrillLevel } from "../types";
import { getEngland, getScotland } from "../../../lib/__fixtures__";

const england = getEngland();
const scotland = getScotland();
const northEast = england.regions.find((r) => r.label === "North East")!;
const scotlandRegion = scotland.regions[0]!;

describe("goBackDrill", () => {
  it.each([
    [{ type: "root" }, { type: "boundary-choice" }],
    [{ type: "nhs" }, { type: "boundary-choice" }],
    [{ type: "boundary-choice" }, { type: "boundary-choice" }],
  ] as const)("goes from %j back to %j", (current, expected) => {
    expect(goBackDrill(current)).toEqual(expected);
  });

  it("goes from a country list back to local authorities", () => {
    expect(goBackDrill({ type: "country", country: england })).toEqual({
      type: "root",
    });
  });

  it("goes from an England region back to that country", () => {
    expect(
      goBackDrill({
        type: "region",
        country: england,
        region: northEast,
      })
    ).toEqual({ type: "country", country: england });
  });

  it("skips the country list when going back from a Scotland district view", () => {
    expect(
      goBackDrill({
        type: "region",
        country: scotland,
        region: scotlandRegion,
      })
    ).toEqual({ type: "root" });
  });
});

describe("getPanelTitle", () => {
  it.each([
    [{ type: "boundary-choice" }, "Choose boundary type"],
    [{ type: "nhs" }, "NHS Trusts"],
    [{ type: "root" }, "Local authorities"],
  ] as const)("titles %j as %s", (drill, title) => {
    expect(getPanelTitle(drill)).toBe(title);
  });

  it("uses the country name for a country view", () => {
    expect(getPanelTitle({ type: "country", country: england })).toBe("England");
  });

  it("uses country › region for a region view", () => {
    expect(
      getPanelTitle({
        type: "region",
        country: england,
        region: northEast,
      })
    ).toBe("England › North East");
  });
});

describe("getBackLabel", () => {
  it.each([
    [
      {
        type: "region" as const,
        country: england,
        region: northEast,
      },
      "Back to England regions",
    ],
    [{ type: "country" as const, country: england }, "Back to all countries"],
    [{ type: "root" as const }, "Back to boundary type"],
    [{ type: "nhs" as const }, "Back to boundary type"],
    [{ type: "boundary-choice" as const }, ""],
  ])("labels going back from the current view", (drill, label) => {
    expect(getBackLabel(drill as DrillLevel)).toBe(label);
  });
});
