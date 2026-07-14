import { describe, expect, it } from "vitest";
import {
  getColumnGlossary,
  lookupFeedType,
  normaliseFeedTypeKey,
} from "../feed-quality-glossary";

describe("normaliseFeedTypeKey", () => {
  it.each([
    ["ScheduledSession", "scheduledsession"],
    ["Scheduled session", "scheduledsession"],
    ["scheduled-session", "scheduledsession"],
  ] as const)("normalises %as to %s", (input, key) => {
    expect(normaliseFeedTypeKey(input)).toBe(key);
  });
});

describe("lookupFeedType", () => {
  it("finds a known feed type", () => {
    expect(lookupFeedType("ScheduledSession")?.label).toBe("Scheduled session");
  });

  it("maps aliases that end in slot to the Slot entry", () => {
    expect(lookupFeedType("IndividualFacilityUseSlot")?.label).toBe("Slot");
  });

  it("returns undefined for unknown feed type", () => {
    expect(lookupFeedType("NotARealFeedType")).toBeUndefined();
  });
});

describe("getColumnGlossary", () => {
  it("finds a known column key", () => {
    expect(getColumnGlossary("location")?.label).toBe("Location");
  });

  it("returns undefined for an unknown column key", () => {
    expect(getColumnGlossary("not-a-column")).toBeUndefined();
  });
});
