"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getFocusableElements } from "../lib/focusable";

type UseFocusTrapOptions = {
  /** Return focus to the previously focused element when the trap deactivates */
  restoreFocus?: boolean;
};

/**
 * Keep keyboard focus inside a modal dialog (Tab / Shift+Tab wrap within the container).
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  options: UseFocusTrapOptions = { restoreFocus: true }
) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const root = containerRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusables = getFocusableElements(root);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    root.addEventListener("keydown", handleKeyDown);
    return () => {
      root.removeEventListener("keydown", handleKeyDown);
      if (options.restoreFocus && previouslyFocused.current?.focus) {
        previouslyFocused.current.focus();
      }
    };
  }, [active, containerRef, options.restoreFocus]);
}
