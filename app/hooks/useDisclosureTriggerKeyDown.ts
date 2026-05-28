"use client";

import { useCallback } from "react";

type UseDisclosureTriggerKeyDownParams = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

/**
 * Standard keyboard behaviour for a disclosure/popover trigger button.
 * Opens on Enter, Space, or ArrowDown/Up when closed; Escape closes when open.
 */
export function useDisclosureTriggerKeyDown({
  open,
  onOpen,
  onClose,
}: UseDisclosureTriggerKeyDownParams) {
  return useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowUp":
          if (!open) {
            event.preventDefault();
            onOpen();
          }
          break;
        case "Enter":
        case " ":
          if (!open) {
            event.preventDefault();
            onOpen();
          }
          break;
        case "Escape":
          if (open) {
            event.preventDefault();
            onClose();
          }
          break;
      }
    },
    [open, onOpen, onClose]
  );
}
