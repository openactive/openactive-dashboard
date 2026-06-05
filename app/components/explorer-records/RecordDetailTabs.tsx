"use client";

import { useId, useRef, useState } from "react";

import type { OpportunityRecord } from "../../types/opportunity-records";
import { RecordJsonView } from "./RecordJsonView";
import { RecordTidyView } from "./RecordTidyView";

type DetailTabKey = "tidy" | "json";

interface DetailTab {
  key: DetailTabKey;
  label: string;
}

const TABS: DetailTab[] = [
  { key: "tidy", label: "Tidy view" },
  { key: "json", label: "Raw JSON" },
];

const HORIZONTAL_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

interface RecordDetailTabsProps {
  record: OpportunityRecord;
}

/**
 * Tidy / Raw JSON tab strip. Standard ARIA tabs pattern: real role=tab
 * buttons, roving tabindex, ArrowLeft/Right + Home/End to switch.
 */
export function RecordDetailTabs({ record }: RecordDetailTabsProps) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<DetailTabKey>("tidy");
  const tabRefs = useRef<Record<DetailTabKey, HTMLButtonElement | null>>({
    tidy: null,
    json: null,
  });

  const onTabsKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!HORIZONTAL_KEYS.has(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;

    const nextKey = TABS[nextIndex].key;
    setActiveTab(nextKey);
    tabRefs.current[nextKey]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Record detail views"
        aria-orientation="horizontal"
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-oa-grey-200 px-1 [scrollbar-width:thin]"
      >
        {TABS.map((tab, index) => {
          const selected = tab.key === activeTab;
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
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(event) => onTabsKeyDown(event, index)}
              className={`-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${
                selected
                  ? "border-oa-cyan text-oa-navy"
                  : "border-transparent text-oa-grey-600 hover:text-oa-navy"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => {
        const selected = tab.key === activeTab;
        return (
          <div
            key={tab.key}
            id={`${baseId}-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.key}`}
            hidden={!selected}
            tabIndex={0}
            className="min-h-[16rem] py-5 focus:outline-none"
          >
            {selected ? (
              tab.key === "tidy" ? (
                <RecordTidyView record={record} />
              ) : (
                <RecordJsonView record={record} />
              )
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
