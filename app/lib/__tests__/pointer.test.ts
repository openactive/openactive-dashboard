/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isCoarsePointer, canHover } from "../pointer";

function mockMatchMedia(options: { coarse?: boolean; canHover?: boolean }) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === "(pointer: coarse)"
          ? Boolean(options.coarse)
          : query === "(hover: hover) and (pointer: fine)"
            ? Boolean(options.canHover)
            : false,
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
    mockMatchMedia({ coarse: true });
    expect(isCoarsePointer()).toBe(true);
  });

  it("returns false when the device reports a fine pointer", () => {
    mockMatchMedia({ coarse: false });
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

describe("canHover", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns true when hover and fine pointer are available", () => {
    mockMatchMedia({ canHover: true });
    expect(canHover()).toBe(true);
  });

  it("returns false when the device cannot hover", () => {
    mockMatchMedia({ canHover: false });
    expect(canHover()).toBe(false);
  });

  it("returns false when matchMedia is not available", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: undefined,
    });
    expect(canHover()).toBe(false);
  });
});
