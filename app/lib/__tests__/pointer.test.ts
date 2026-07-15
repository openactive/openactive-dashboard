/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isCoarsePointer } from "../pointer";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(pointer: coarse)" ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("isCoarsePointer", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns true when the device reports a coarse pointer", () => {
    mockMatchMedia(true);
    expect(isCoarsePointer()).toBe(true);
  });

  it("returns false when the device reports a fine pointer", () => {
    mockMatchMedia(false);
    expect(isCoarsePointer()).toBe(false);
  });

  it("returns false when matchMedia is not available", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    expect(isCoarsePointer()).toBe(false);
  });
});
