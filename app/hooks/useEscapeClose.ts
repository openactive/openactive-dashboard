"use client";

import { useEffect } from "react";

/**
 * Registers a keydown listener that calls `onClose` when Escape is pressed,
 * but only while `isOpen` is true. Cleans up on unmount or when closed.
 */
export function useEscapeClose(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}
