/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDisclosureTriggerKeyDown } from "../useDisclosureTriggerKeyDown";
import { use } from "react";

function keyEvent(key: string) {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe("useDisclosureTriggerKeyDown", () => {
  it("opens on Enter when closed", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDisclosureTriggerKeyDown({ open: false, onOpen, onClose }),
    );

    const event = keyEvent("Enter");
    result.current(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("opens on Space or ArrowDown when closed", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() =>
      useDisclosureTriggerKeyDown({
        open: false,
        onOpen,
        onClose: vi.fn(),
      }),
    );

    result.current(keyEvent(" "));
    result.current(keyEvent("ArrowDown"));

    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it("does not open again when already open", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() =>
      useDisclosureTriggerKeyDown({
        open: true,
        onOpen,
        onClose: vi.fn(),
      }),
    );

    result.current(keyEvent("Enter"));

    expect(onOpen).not.toHaveBeenCalled();
  });

  it("closes on Escape when open", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDisclosureTriggerKeyDown({
        open: true,
        onOpen: vi.fn(),
        onClose,
      }),
    );

    const event = keyEvent("Escape");
    result.current(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape when already closed", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useDisclosureTriggerKeyDown({
        open: false,
        onOpen: vi.fn(),
        onClose,
      }),
    );

    result.current(keyEvent("Escape"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
