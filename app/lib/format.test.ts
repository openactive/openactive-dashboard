import { describe, expect, it } from "vitest";
import { formatFullNumber } from "./format";

describe("format (smoke)", () => {
  it("formats numbers with en-GB grouping", () => {
    expect(formatFullNumber(4885)).toBe("4,885");
  });
});
