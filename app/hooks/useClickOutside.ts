"use client";

import { useEffect, type RefObject } from "react";

/** Calls `onClickOutside` on mousedown outside `containerRef` while `enabled`. */
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
