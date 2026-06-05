"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

import type { OpportunityRecord } from "../../types/opportunity-records";
import {
  getRecordKindLabel,
  getRecordTitle,
} from "../../lib/record-display";
import { useEscapeClose } from "../../hooks/useEscapeClose";
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

interface RecordDetailPanelProps {
  /** Stable DOM id so the triggering card can aria-controls this panel. */
  panelId: string;
  record: OpportunityRecord;
  onClose: () => void;
  /**
   * Element to return focus to when the panel closes — usually the
   * triggering card's button. Optional because the section may unmount
   * the trigger if filters change.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * Inline detail view for a selected record.
 *
 * Opens below the grid (no overlay) so users keep the gallery in view.
 * Two tabs share the same data: a friendly summary (Tidy view) and
 * the raw OpenActive payload (Raw JSON). The tab strip uses the same
 * ARIA pattern as TopBreakdownTabs (roving tabindex + arrow keys).
 */
export function RecordDetailPanel({
  panelId,
  record,
  onClose,
  returnFocusRef,
}: RecordDetailPanelProps) {
  const headingId = `${panelId}-heading`;
  const baseId = useId();

  const [activeTab, setActiveTab] = useState<DetailTabKey>("tidy");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<DetailTabKey, HTMLButtonElement | null>>({
    tidy: null,
    json: null,
  });

  useEscapeClose(true, onClose);

  // When the panel opens, move focus to the heading and scroll the
  // panel into view if it's off-screen. Honours prefers-reduced-motion.
  useEffect(() => {
    const heading = headingRef.current;
    const article = articleRef.current;
    if (!heading || !article) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rect = article.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const offScreen = rect.top < 0 || rect.top > viewportHeight - 100;

    if (offScreen) {
      article.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }

    // Wait for any smooth scroll to settle before focusing — focusing
    // mid-animation cancels the scroll in Safari/Chrome.
    const delay = offScreen && !reduced ? 350 : 0;
    const timer = window.setTimeout(() => {
      heading.focus({ preventScroll: true });
    }, delay);
    return () => window.clearTimeout(timer);
    // record.id changes when the user clicks a different card; we want
    // to re-run focus management each time the displayed record swaps.
  }, [record.feed_id, record.id]);

  // Restore focus to the triggering card when the panel unmounts.
  useEffect(() => {
    return () => {
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

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

  const title = getRecordTitle(record);
  const kindLabel = getRecordKindLabel(record);

  return (
    <article
      ref={articleRef}
      id={panelId}
      role="region"
      aria-labelledby={headingId}
      className="mt-6 overflow-hidden rounded-2xl border border-oa-grey-200 bg-white shadow-[0_12px_48px_rgba(34,53,130,0.12)]"
    >
      <header className="flex items-start justify-between gap-4 border-b-4 border-oa-cyan bg-oa-navy px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            {kindLabel}
            {record.publisher_name ? (
              <span className="font-medium normal-case tracking-normal text-white/70">
                {" "}
                · {record.publisher_name}
              </span>
            ) : null}
          </p>
          <h3
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="mt-1 text-lg font-bold text-white focus:outline-none sm:text-xl"
          >
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close record details"
          className="shrink-0 cursor-pointer rounded-full p-1.5 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div className="px-5 pt-4 sm:px-6">
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
    </article>
  );
}
