"use client";

import { useCallback, type RefObject } from "react";

/**
 * Closes a popover when focus leaves its container (e.g. Tab to the next field).
 */
export function useFocusLeaveClose(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClose: () => void
) {
  return useCallback(
    (event: React.FocusEvent) => {
      if (!enabled) return;
      const next = event.relatedTarget as Node | null;
      if (next && containerRef.current?.contains(next)) return;
      onClose();
    },
    [containerRef, enabled, onClose]
  );
}
