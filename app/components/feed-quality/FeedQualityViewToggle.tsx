"use client";

import { useRef, type KeyboardEvent, type RefObject } from "react";
import {
  FEED_QUALITY_VIEWS,
  VIEW_CONFIGS,
  type FeedQualityView,
} from "../../lib/feed-quality";

interface FeedQualityViewToggleProps {
  value: FeedQualityView;
  onChange: (next: FeedQualityView) => void;
  tabListRef?: RefObject<HTMLDivElement | null>;
  onArrowDownFromTab?: () => void;
}

const HORIZONTAL_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

export function FeedQualityViewToggle({
  value,
  onChange,
  tabListRef,
  onArrowDownFromTab,
}: FeedQualityViewToggleProps) {
  const tabRefs = useRef<Record<FeedQualityView, HTMLButtonElement | null>>({
    data: null,
    content: null,
  });

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onArrowDownFromTab?.();
      return;
    }

    if (!HORIZONTAL_KEYS.has(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % FEED_QUALITY_VIEWS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (index - 1 + FEED_QUALITY_VIEWS.length) % FEED_QUALITY_VIEWS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = FEED_QUALITY_VIEWS.length - 1;
    }

    const nextView = FEED_QUALITY_VIEWS[nextIndex];
    onChange(nextView);
    tabRefs.current[nextView]?.focus();
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Quality view"
      aria-orientation="horizontal"
      className="inline-flex w-full rounded-sm bg-oa-grey-100 p-1 text-sm font-semibold lg:w-auto"
    >
      {FEED_QUALITY_VIEWS.map((view, index) => {
        const selected = view === value;
        return (
          <button
            key={view}
            ref={(element) => {
              tabRefs.current[view] = element;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="feed-quality-table"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(view)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={`flex-1 cursor-pointer whitespace-nowrap rounded-sm px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan lg:flex-none ${
              selected
                ? "bg-white text-oa-navy shadow-sm"
                : "text-oa-grey-600 hover:text-oa-navy"
            }`}
          >
            {VIEW_CONFIGS[view].label}
          </button>
        );
      })}
    </div>
  );
}
