import { describe, expect, it } from "vitest";
import {
  formatSocioProportion,
  formatSocioRate,
  formatSocioRateChange,
  opportunitiesPer1000,
} from "../socio-context";

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
