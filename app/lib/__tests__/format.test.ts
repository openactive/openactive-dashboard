import { describe, expect, it } from "vitest";
import { formatFullNumber, formatNumber } from "../format";

describe("formatFullNumber", () => {
  it("adds commas using en-GB grouping", () => {
    expect(formatFullNumber(4485)).toBe("4,485");
  });
});

describe("formatNumber", () => {
  it("adds commas for numbers under one million", () => {
    expect(formatNumber(4885)).toBe("4,885");
  });

  it("shortens whole millions with m", () => {
    expect(formatNumber(2_000_000)).toBe("2m");
  });

  it("shortens fractional millions to one decimal place", () => {
    expect(formatNumber(10_461_194)).toBe("10.5m");
  });
});