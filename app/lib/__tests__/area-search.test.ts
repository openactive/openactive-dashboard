import { describe, expect, it } from "vitest";
import {
  scoreAreaMatch,
  searchAreasGlobal,
  searchAreasInCountry,
} from "../area-search";
import {
  getEngland,
  HARTLEPOOL,
  HIGHLAND,
  testHierarchy,
} from "../__fixtures__";

describe("scoreAreaMatch", () => {
  it("gives the highest score for an exact name match, ignoring letter case", () => {
    expect(scoreAreaMatch("Hartlepool", "hartlepool")).toBe(10_000);
  });

  it("scores a match at the start of a word higher than one in the middle", () => {
    expect(scoreAreaMatch("Lewes District", "Dist")).toBeGreaterThan(
      scoreAreaMatch("Lewes District", "stric")
    );
  });

  it("still matches when the query letters appear in order but not together", () => {
    expect(scoreAreaMatch("Hartlepool", "htp")).toBeGreaterThan(-Infinity);
  });

  it("treats accents as the same letter", () => {
    expect(scoreAreaMatch("São Paulo", "sao paulo")).toBe(10_000);
  });

  it("returns -Infinity when nothing matches", () => {
    expect(scoreAreaMatch("Hartlepool", "xyz")).toBe(-Infinity);
  });

  it("returns 0 for an empty query", () => {
    expect(scoreAreaMatch("Hartlepool", "")).toBe(0);
  });
});

describe("searchAreasInCountry", () => {
  const england = getEngland();

  it("returns no results for an empty query", () => {
    expect(searchAreasInCountry(england, "")).toEqual([]);
  });

  it("only searches districts inside that country", () => {
    const hits = searchAreasInCountry(england, "pool");
    expect(hits.map((h) => h.name)).toContain(HARTLEPOOL.name);
    expect(hits.every((h) => h.countryLabel === "England")).toBe(true);
  });

  it("puts the best match first", () => {
    expect(searchAreasInCountry(england, "hart")[0]?.name).toBe(HARTLEPOOL.name);
  });
});

describe("searchAreasGlobal", () => {
  it("returns no results for an empty query", () => {
    expect(searchAreasGlobal(testHierarchy, "")).toEqual([]);
  });

  it("finds districts across every country", () => {
    const names = searchAreasGlobal(testHierarchy, "h").map((h) => h.name);
    expect(names).toEqual(
      expect.arrayContaining([HARTLEPOOL.name, HIGHLAND.name])
    );
  });

  it("returns an exact match first", () => {
    expect(searchAreasGlobal(testHierarchy, "Highland")[0]?.name).toBe(
      HIGHLAND.name
    );
  });
});
