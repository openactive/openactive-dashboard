"use client";

import {
  FEED_QUALITY_VIEWS,
  VIEW_CONFIGS,
  type FeedQualityView,
} from "../../lib/feed-quality";

interface FeedQualityViewToggleProps {
  value: FeedQualityView;
  onChange: (next: FeedQualityView) => void;
}

export function FeedQualityViewToggle({
  value,
  onChange,
}: FeedQualityViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Quality view"
      className="inline-flex w-full rounded-sm bg-oa-grey-100 p-1 text-sm font-semibold lg:w-auto"
    >
      {FEED_QUALITY_VIEWS.map((view) => {
        const selected = view === value;
        return (
          <button
            key={view}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(view)}
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
