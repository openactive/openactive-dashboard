"use client";

import { useCallback, type RefObject } from "react";
import { getFocusableElements } from "../lib/focusable";

/**
 * Closes a popover when Tab moves forward from the last focusable item,
 * or Shift+Tab backward from the first (before focus leaves the container).
 */
export function useTabExitClose(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClose: () => void
) {
  return useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled || event.key !== "Tab") return;

      const root = containerRef.current;
      if (!root) return;

      const focusables = getFocusableElements(root);
      if (focusables.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      if (!active || !root.contains(active)) return;

      if (event.shiftKey && active === focusables[0]) {
        onClose();
      } else if (!event.shiftKey && active === focusables[focusables.length - 1]) {
        onClose();
      }
    },
    [containerRef, enabled, onClose]
  );
}
