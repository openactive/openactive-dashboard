"use client";

import { useId, useRef, useState } from "react";
import { formatNumber } from "../../lib/format";
import type { RankedItem } from "../../lib/explore-filters";
import { RankedList } from "./RankedList";

export type TabKey =
  | "areas"
  | "publishers"
  | "feeds"
  | "providers"
  | "activities";

interface TabSpec {
  key: TabKey;
  label: string;
  items: RankedItem[];
  total: number;
  barColor: string;
}

interface TopBreakdownTabsProps {
  tabs: TabSpec[];
}

const HORIZONTAL_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

/**
 * ARIA tabs pattern: tab buttons in a tablist, panels rendered below.
 *
 * - Roving tabindex (only the active tab is in the tab order).
 * - Arrow keys + Home/End move between tabs and shift focus.
 * - Inactive panels use `hidden` so assistive tech skips them.
 * - The tablist scrolls horizontally on narrow screens; an `aria-orientation`
 *   keeps left/right navigation semantically correct.
 */
export function TopBreakdownTabs({ tabs }: TopBreakdownTabsProps) {
  const [active, setActive] = useState<TabKey>(tabs[0]?.key ?? "areas");
  const tabRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({
    areas: null,
    publishers: null,
    feeds: null,
    providers: null,
    activities: null,
  });
  const baseId = useId();

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!HORIZONTAL_KEYS.has(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    const nextKey = tabs[nextIndex].key;
    setActive(nextKey);
    const nextEl = tabRefs.current[nextKey];
    nextEl?.focus();
    nextEl?.scrollIntoView({ inline: "nearest", block: "nearest" });
  };

  return (
    <div>
      {/* Horizontal scroll on small screens so tabs never wrap or get cut off. */}
      <div
        role="tablist"
        aria-label="Top breakdowns"
        aria-orientation="horizontal"
        className="relative -mx-1 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-oa-grey-200 px-1 [scrollbar-width:thin]"
      >
        {tabs.map((tab, index) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              id={`${baseId}-tab-${tab.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oa-cyan ${
                selected
                  ? "border-oa-cyan text-oa-navy"
                  : "border-transparent text-oa-grey-600 hover:text-oa-navy"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                  selected
                    ? "bg-oa-cyan/15 text-oa-navy"
                    : "bg-oa-grey-100 text-oa-grey-600"
                }`}
                aria-hidden="true"
              >
                {formatNumber(tab.total)}
              </span>
              <span className="sr-only">, {tab.total} total</span>
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const selected = tab.key === active;
        const showingMore = tab.total > tab.items.length;
        return (
          <div
            key={tab.key}
            id={`${baseId}-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.key}`}
            hidden={!selected}
            tabIndex={0}
            className="pt-5 focus:outline-none"
          >
            {selected && (
              <>
                <p className="mb-3 text-xs text-oa-grey-600">
                  {showingMore
                    ? `Showing top ${tab.items.length} of ${formatNumber(tab.total)}`
                    : `${tab.items.length} total`}
                </p>
                <RankedList
                  items={tab.items}
                  barColor={tab.barColor}
                  unitLabel="opportunities"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
