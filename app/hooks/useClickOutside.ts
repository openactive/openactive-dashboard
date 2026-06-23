"use client";

import { useEffect, type RefObject } from "react";

/** Calls `onClickOutside` on mousedown outside `containerRef` while `enabled`. */
export function useClickOutside(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClickOutside: () => void,
  secondaryRef?: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      const root = containerRef.current;
      const secondary = secondaryRef?.current ?? null;
      const inside =
        (root?.contains(target) ?? false) ||
        (secondary?.contains(target) ?? false);
      if (!inside) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [containerRef, enabled, onClickOutside, secondaryRef]);
}
