"use client";

import { useEffect, useRef, useState } from "react";
import { useReactiveOpportunityRecords } from "../../hooks/useReactiveOpportunityRecords";
import type { ExplorerFilters } from "../../lib/explore-filters";
import type { OpportunityRecord } from "../../types/opportunity-records";
import { RecordsGrid } from "./RecordsGrid";

type CodeMaps = {
  districtCodeByName: Map<string, string>;
  countryCodeById: Map<string, string>;
  regionCodeByScope: Map<string, string>;
};

interface ExplorerRecordsSectionProps {
  filters: ExplorerFilters;
  maps: CodeMaps;
  selectionLabel: string;
}

function recordKey(record: OpportunityRecord): string {
  return `${record.feed_id}:${record.id}`;
}

/**
 * Layer 3 — record-level gallery, anchored at #records.
 *
 * The fetch is deferred until the section enters the viewport (or the
 * user follows the "Explore the records" CTA, which scrolls it into view).
 * That keeps the initial Layer 2 experience light without sacrificing
 * discoverability — the heading is always in the DOM so landmark
 * navigation works from page load.
 */
export function ExplorerRecordsSection({
  filters,
  maps,
  selectionLabel,
}: ExplorerRecordsSectionProps) {
  const [enabled, setEnabled] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  // Selection lives here for step 3 so cards can reflect aria-pressed.
  // Step 4 will hoist this to drive the detail slide-down panel.
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (enabled || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnabled(true);
          observer.disconnect();
        }
      },
      // Start loading slightly before the section is in view so
      // skeletons are already swapping for content as the user arrives.
      { rootMargin: "200px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  const {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    status,
    loadMore,
    retry,
  } = useReactiveOpportunityRecords({ filters, maps, enabled });

  // Reset selection when the underlying filters change so a stale id
  // doesn't keep highlighting a card that's no longer visible.
  useEffect(() => {
    setSelectedKey(null);
  }, [filters]);

  return (
    <section
      ref={sectionRef}
      id="records"
      aria-labelledby="records-heading"
      className="mt-12 scroll-mt-24"
    >
      <header className="border-l-[6px] border-oa-cyan pl-5 rounded-sm">
        <h3
          id="records-heading"
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold text-oa-navy tracking-tight focus:outline-none"
        >
          Explore individual records
        </h3>
        <p className="mt-3 text-base text-oa-grey-700 leading-relaxed max-w-prose">
          A live look at the publisher records that make up the figures
          above
          {selectionLabel && selectionLabel !== "All UK areas"
            ? ` for ${selectionLabel}`
            : ""}
          . Inspect a card to see the full OpenActive data each publisher
          provides.
        </p>
      </header>

      {/* Polite live region so SR users get a quiet status update. */}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <div className="mt-6">
        {enabled ? (
          <RecordsGrid
            items={items}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            selectedRecordId={selectedKey}
            onSelect={(record) => setSelectedKey(recordKey(record))}
            onLoadMore={loadMore}
            onRetry={retry}
          />
        ) : (
          // Reserve vertical space before the section comes into view so
          // the page doesn't jump when the grid mounts.
          <div
            aria-hidden="true"
            className="h-64 rounded-2xl bg-slate-50 ring-1 ring-slate-200"
          />
        )}
      </div>
    </section>
  );
}
