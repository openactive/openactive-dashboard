import { describe, expect, it } from "vitest";
import type { GeoPath } from "d3";
import {
  buildColorScale,
  computeTranslateExtent,
  fillForFeature,
  getFitFeatures,
  scopeKey,
  strokeForFeature,
  strokeWidthForFeature,
  type LadFeature,
} from "../map-styles";

function feature(name: string, code: string): LadFeature {
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [] },
    properties: { geo_name: name, geo_code: code, geo_type: "lad" },
  };
}

const lewes = feature("Lewes", "E06000059");
const hartlepool = feature("Hartlepool", "E06000001");
const counts = new Map([
  ["Hartlepool", 42],
  ["Lewes", 18],
]);
const color = buildColorScale(counts);

describe("buildColorScale", () => {
  it("uses the highest positive count as the top of the scale", () => {
    expect(buildColorScale(counts).domain()).toEqual([0, 42]);
  });

  it("falls back to 1 when every count is zero", () => {
    expect(buildColorScale(new Map([["a", 0]])).domain()).toEqual([0, 1]);
  });
});

describe("fill, stroke, and stroke width", () => {
  it("uses the out-of-scope fill when an area is not in the current selection", () => {
    expect(
      fillForFeature(lewes, counts, color, new Set(["Hartlepool"]), null, false)
    ).toBe("#e8edf2");
  });

  it("treats an area as selected when the selected key matches its code", () => {
    expect(
      strokeForFeature(lewes, null, "E06000059")
    ).toBe("#223582");
    expect(strokeWidthForFeature(lewes, null, "E06000059")).toBe(3);
  });

  it("treats an area as in scope when the scope set has its code", () => {
    expect(
      strokeForFeature(lewes, new Set(["E06000059"]), null)
    ).toBe("#8fa3b8");
  });

  it("uses the selected fallback fill when the selected area has no data", () => {
    expect(
      fillForFeature(lewes, new Map(), color, null, "Lewes", false)
    ).toBe("#009de1");
  });

  it("uses white fill when an in-scope area has no data", () => {
    expect(
      fillForFeature(feature("Empty", "X"), new Map(), color, null, null, false)
    ).toBe("#fff");
  });
});

describe("getFitFeatures", () => {
  it("keeps only features that have data when that is a smaller set", () => {
    const features = [hartlepool, lewes, feature("Empty", "X")];
    expect(getFitFeatures(features, new Map([["Hartlepool", 42]]))).toEqual([
      hartlepool,
    ]);
  });

  it("returns every feature when all of them have data", () => {
    const features = [hartlepool, lewes];
    expect(getFitFeatures(features, counts)).toEqual(features);
  });
});

describe("scopeKey", () => {
  it("builds a stable key from areas with positive counts", () => {
    expect(scopeKey(counts)).toBe("Hartlepool,Lewes");
  });

  it('returns "all" when nothing has a positive count', () => {
    expect(scopeKey(new Map([["a", 0]]))).toBe("all");
  });
});

describe("computeTranslateExtent", () => {
  it("adds a margin around the map bounds", () => {
    const path = {
      bounds: () => [
        [10, 20],
        [110, 220],
      ],
    } as unknown as GeoPath;

    expect(
      computeTranslateExtent(path, { type: "FeatureCollection", features: [] }, 800, 600)
    ).toEqual([
      [-14, -4],
      [134, 244],
    ]);
  });

  it("falls back to the full viewport when bounds are not finite", () => {
    const path = {
      bounds: () => [
        [Number.NaN, 0],
        [1, 1],
      ],
    } as unknown as GeoPath;

    expect(
      computeTranslateExtent(path, { type: "FeatureCollection", features: [] }, 800, 600)
    ).toEqual([
      [0, 0],
      [800, 600],
    ]);
  });
});
