"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls `onClickOutside` when the user presses the mouse button outside `containerRef`.
 * Only active while `enabled` is true (e.g. when a popover is open).
 */
export function useClickOutside(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClickOutside: () => void
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(event: MouseEvent) {
      const root = containerRef.current;
      if (root && !root.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [containerRef, enabled, onClickOutside]);
}
