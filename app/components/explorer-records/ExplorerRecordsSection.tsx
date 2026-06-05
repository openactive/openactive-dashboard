"use client";

import { useEffect, useRef, useState } from "react";
import { useReactiveOpportunityRecords } from "../../hooks/useReactiveOpportunityRecords";
import type { ExplorerFilters } from "../../lib/explore-filters";

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

  const { items, isLoading, hasMore, total, error, status } =
    useReactiveOpportunityRecords({ filters, maps, enabled });

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
        {/*
          Step 2 placeholder — the real gallery, load-more and detail panel
          land in steps 3 and beyond. Showing a tiny diagnostic line so we
          can verify the wiring during review.
        */}
        <div className="rounded-xl border border-dashed border-oa-grey-300 bg-white px-5 py-8 text-center text-sm text-oa-grey-600">
          {!enabled
            ? "Records will load as you reach this section…"
            : error
              ? error
              : isLoading
                ? "Loading records…"
                : items.length === 0
                  ? "No records match the current filters."
                  : `${items.length}${total ? ` of ${total}` : ""} records ready · grid arrives in step 3${hasMore ? " · more available" : ""}`}
        </div>
      </div>
    </section>
  );
}
