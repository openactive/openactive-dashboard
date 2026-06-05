"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useReactiveOpportunityRecords } from "../../hooks/useReactiveOpportunityRecords";
import { ALL_FILTER, type ExplorerFilters } from "../../lib/explore-filters";
import { formatFullNumber } from "../../lib/format";
import {
  getRecordKindLabel,
  getRecordTitle,
} from "../../lib/record-display";
import type { OpportunityRecord } from "../../types/opportunity-records";
import { RecordDetailDrawer } from "./RecordDetailDrawer";
import { RecordDetailTabs } from "./RecordDetailTabs";
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
  // We track the full record (not just the key) so the drawer can render
  // even if the record is no longer in `items` due to a refetch.
  const [selectedRecord, setSelectedRecord] =
    useState<OpportunityRecord | null>(null);

  // ref points at the card button that opened the drawer — used to
  // restore focus when the drawer closes.
  const triggerRef = useRef<HTMLElement | null>(null);

  // Stable ids so cards (aria-controls) and the drawer agree.
  const sectionUid = useId();
  const drawerId = `${sectionUid}-drawer`;
  const cardIdPrefix = `${sectionUid}-card`;

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
    total,
    error,
    status,
    loadMore,
    retry,
  } = useReactiveOpportunityRecords({ filters, maps, enabled });

  // Reset selection when the underlying filters change so a stale
  // record doesn't keep the drawer open with no matching card.
  useEffect(() => {
    setSelectedRecord(null);
  }, [filters]);

  const handleSelect = useCallback(
    (record: OpportunityRecord) => {
      const key = recordKey(record);
      // Capture which button opened the drawer so we can return focus
      // when the drawer closes (or when the selection toggles off).
      triggerRef.current = document.getElementById(
        `${cardIdPrefix}-${record.feed_id}-${record.id}`
      );

      setSelectedRecord((current) =>
        current && recordKey(current) === key ? null : record
      );
    },
    [cardIdPrefix]
  );

  const handleClose = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const selectedKey = selectedRecord ? recordKey(selectedRecord) : null;

  // Soft hint when the user is browsing the unfiltered firehose. We
  // only mention "narrow your filters" when no filter is set yet —
  // once they've narrowed at all, this nudge would just be noise.
  const noFiltersApplied =
    filters.district === ALL_FILTER &&
    filters.areaScope === ALL_FILTER &&
    filters.publisher === ALL_FILTER &&
    filters.activity === ALL_FILTER;
  const showBroadHint =
    enabled &&
    noFiltersApplied &&
    items.length > 0 &&
    total !== undefined &&
    total > items.length * 2;

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

      {showBroadHint ? (
        <p className="mt-4 rounded-md bg-oa-cyan/10 px-4 py-2 text-sm text-oa-navy ring-1 ring-oa-cyan/30">
          Showing the first {items.length} of{" "}
          <span className="font-semibold">{formatFullNumber(total!)}</span>{" "}
          records — narrow the filters above to focus on a specific area,
          publisher, or activity.
        </p>
      ) : null}

      <div className="mt-6">
        {enabled ? (
          <RecordsGrid
            items={items}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            selectedRecordId={selectedKey}
            detailDrawerId={drawerId}
            cardButtonIdPrefix={cardIdPrefix}
            onSelect={handleSelect}
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

        {selectedRecord ? (
          <RecordDetailDrawer
            drawerId={drawerId}
            // Keying titleId on the record id makes the drawer's
            // focus-on-mount effect re-fire when the user swaps cards
            // without closing the drawer first.
            titleId={`${drawerId}-heading-${selectedRecord.feed_id}-${selectedRecord.id}`}
            eyebrow={
              <>
                {getRecordKindLabel(selectedRecord)}
                {selectedRecord.publisher_name ? (
                  <span className="font-medium normal-case tracking-normal text-white/70">
                    {" "}
                    · {selectedRecord.publisher_name}
                  </span>
                ) : null}
              </>
            }
            title={getRecordTitle(selectedRecord)}
            onClose={handleClose}
            returnFocusRef={triggerRef}
          >
            <RecordDetailTabs record={selectedRecord} />
          </RecordDetailDrawer>
        ) : null}
      </div>
    </section>
  );
}
