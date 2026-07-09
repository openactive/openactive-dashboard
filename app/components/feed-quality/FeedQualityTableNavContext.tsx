"use client";

import {
  createContext,
  useCallback,
  useContext,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { focusAdjacentFeedQualityNav } from "../../lib/feed-quality-table-nav";

type FeedQualityTableNavContextValue = {
  containerRef: RefObject<HTMLElement | null>;
  onArrowUpFromFirst?: () => void;
};

const FeedQualityTableNavContext =
  createContext<FeedQualityTableNavContextValue | null>(null);

export function FeedQualityTableNavProvider({
  containerRef,
  onArrowUpFromFirst,
  children,
}: FeedQualityTableNavContextValue & { children: ReactNode }) {
  return (
    <FeedQualityTableNavContext.Provider
      value={{ containerRef, onArrowUpFromFirst }}
    >
      {children}
    </FeedQualityTableNavContext.Provider>
  );
}

export function useFeedQualityRowNavKeyDown() {
  const context = useContext(FeedQualityTableNavContext);

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!context) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();
      const current = event.currentTarget;

      if (event.key === "ArrowUp") {
        const moved = focusAdjacentFeedQualityNav(
          context.containerRef.current,
          current,
          "prev"
        );
        if (!moved) context.onArrowUpFromFirst?.();
        return;
      }

      focusAdjacentFeedQualityNav(
        context.containerRef.current,
        current,
        "next"
      );
    },
    [context]
  );
}
