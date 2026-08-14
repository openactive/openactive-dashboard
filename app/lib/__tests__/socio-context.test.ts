import { describe, expect, it } from "vitest";
import {
  formatSocioProportion,
  formatSocioRate,
  formatSocioRateChange,
  hasAlsData,
  hasImdData,
  isEnglandLadRow,
  opportunitiesPer1000,
  resolveSocioContext,
  sumPopulation,
} from "../socio-context";
import {
  hartlepoolSocioRow,
  highlandSocioRow,
  northEastSocioRow,
} from "../__fixtures__";

describe("formatSocioRate", () => {
  it("turns a decimal rate into a percentage string", () => {
    expect(formatSocioRate(0.5782)).toBe("57.8%");
  });
});

describe("formatSocioProportion", () => {
  it("uses the same percentage formatting as formatSocioRate", () => {
    expect(formatSocioProportion(0.4211)).toBe("42.1%");
  });
});

describe("formatSocioRateChange", () => {
  it("formats positive change in percentage points", () => {
    expect(formatSocioRateChange(0.0116)).toBe("+1.2 pp");
  });

  it("formats negative change in percentage points", () => {
    expect(formatSocioRateChange(-0.005)).toBe("-0.5 pp");
  });
});

describe("opportunitiesPer1000", () => {
  it("returns null when population is missing or zero", () => {
    expect(opportunitiesPer1000(100, null)).toBeNull();
    expect(opportunitiesPer1000(100, 0)).toBeNull();
  });

  it("calculates opportunities per thousand people", () => {
    expect(opportunitiesPer1000(9818, 98180)).toBeCloseTo(100, 5);
  });
});

describe("hasImdData", () => {
  it("is true when any IMD field is present", () => {
    expect(hasImdData(hartlepoolSocioRow)).toBe(true);
  });

  it("is false when all IMD fields are null", () => {
    expect(hasImdData(highlandSocioRow)).toBe(false);
  });
});

describe("hasAlsData", () => {
  it("is true when any Active Lives field is present", () => {
    expect(hasAlsData(hartlepoolSocioRow)).toBe(true);
  });

  it("is false when all Active Lives fields are null", () => {
    expect(hasAlsData(highlandSocioRow)).toBe(false);
  });
});

describe("isEnglandLadRow", () => {
  it("is true for an England local authority", () => {
    expect(isEnglandLadRow(hartlepoolSocioRow)).toBe(true);
  });

  it("is false for a Scotland local authority", () => {
    expect(isEnglandLadRow(highlandSocioRow)).toBe(false);
  });
});

describe("sumPopulation", () => {
  it("returns null for an empty list", () => {
    expect(sumPopulation([])).toBeNull();
  });

  it("sums population across rows", () => {
    expect(sumPopulation([hartlepoolSocioRow, highlandSocioRow])).toBe(
      98180 + 237290,
    );
  });
});

describe("resolveSocioContext", () => {
  it("returns empty when there are no rows", () => {
    const view = resolveSocioContext([], 0);

    expect(view.scope).toBe("empty");
    expect(view.blocks.showPopulation).toBe(false);
    expect(view.ladRow).toBeNull();
  });

  it("shows all blocks for a single England local authority", () => {
    const view = resolveSocioContext([hartlepoolSocioRow], 5000);

    expect(view.scope).toBe("single-lad");
    expect(view.ladRow).toEqual(hartlepoolSocioRow);
    expect(view.blocks.showPopulation).toBe(true);
    expect(view.blocks.showOpportunitiesPer1000).toBe(true);
    expect(view.blocks.showImd).toBe(true);
    expect(view.blocks.showAls).toBe(true);
    expect(view.blocks.showEnglandOnlyNote).toBe(false);
    expect(view.totalPopulation).toBe(98180);
    expect(view.opportunitiesPer1000).toBeCloseTo(50.93, 1);
  });

  it("hides IMD and ALS for a single Scotland local authority", () => {
    const view = resolveSocioContext([highlandSocioRow], 1000);

    expect(view.scope).toBe("multi-or-aggregate");
    expect(view.ladRow).toBeNull();
    expect(view.blocks.showPopulation).toBe(true);
    expect(view.blocks.showImd).toBe(false);
    expect(view.blocks.showAls).toBe(false);
    expect(view.blocks.showEnglandOnlyNote).toBe(true);
    expect(view.totalPopulation).toBe(237290);
  });

  it("sums population and hides IMD and ALS for multiple local authorities", () => {
    const view = resolveSocioContext(
      [hartlepoolSocioRow, highlandSocioRow],
      2000,
    );

    expect(view.scope).toBe("multi-or-aggregate");
    expect(view.blocks.showImd).toBe(false);
    expect(view.blocks.showAls).toBe(false);
    expect(view.blocks.showEnglandOnlyNote).toBe(true);
    expect(view.totalPopulation).toBe(98180 + 237290);
  });

  it("shows population only for a region aggregate row", () => {
    const view = resolveSocioContext([northEastSocioRow], 10000);

    expect(view.scope).toBe("multi-or-aggregate");
    expect(view.blocks.showPopulation).toBe(true);
    expect(view.blocks.showImd).toBe(false);
    expect(view.blocks.showAls).toBe(false);
    expect(view.blocks.showEnglandOnlyNote).toBe(true);
    expect(view.totalPopulation).toBe(2760678);
  });
});
