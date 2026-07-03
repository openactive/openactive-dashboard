"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFeedQuality } from "../../hooks/useFeedQuality";
import { ErrorBanner } from "../ErrorBanner";
import { useFeedQualityFilters } from "../FeedQualityFilterProvider";
import { FeedQualitySummary } from "./FeedQualitySummary";
import { FeedQualityTable } from "./FeedQualityTable";
import { FeedQualityViewToggle } from "./FeedQualityViewToggle";
import type { FeedQualityView } from "../../lib/feed-quality";

export function FeedQualitySection() {
  const [enabled, setEnabled] = useState(false);
  const [view, setView] = useState<FeedQualityView>("data");
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
      { rootMargin: "200px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  const filterQuery = useFeedQualityFilters();
  const hasFilters = Object.keys(filterQuery).length > 0;
  const { rows, groups, isLoading, error, retry } = useFeedQuality(
    enabled,
    filterQuery
  );

  const counts = useMemo(() => {
    let okCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    for (const row of rows) {
      if (row.status === "OK") okCount += 1;
      else if (row.status === "WARNING") warningCount += 1;
      else errorCount += 1;
    }
    return { total: rows.length, okCount, warningCount, errorCount };
  }, [rows]);

  // True while a fresh result is loading (first load or a new filter
  // combination). Only the figures and table rows swap to placeholders — the
  // headings, labels, bar track, and view toggle stay put. Cached combinations
  // don't set isLoading, so revisiting a filter set swaps in with no flash.
  const showSkeleton = !enabled || isLoading;

  return (
    <section
      ref={sectionRef}
      id="feed-quality"
      tabIndex={-1}
      className="scroll-mt-4 bg-white py-5 sm:py-8"
      aria-labelledby="feed-quality-heading"
    >
      <div className="mx-auto w-full max-w-448 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <header className="max-w-3xl border-l-[6px] border-oa-cyan pl-5 rounded-sm">
          <h2
            id="feed-quality-heading"
            className="text-3xl sm:text-4xl font-bold text-oa-navy tracking-tight"
          >
            Feed quality
          </h2>
          <p className="mt-4 text-base text-oa-grey-700 leading-relaxed max-w-prose">
            See how each publisher&apos;s feeds measure up. Switch between{" "}
            <strong className="font-semibold text-oa-navy">feed completeness</strong>
            {" "}(the fields that decide whether opportunities count in
            OpenActive&apos;s headline figures) and{" "}
            <strong className="font-semibold text-oa-navy">content quality</strong>
            {" "}(the optional fields that make those opportunities genuinely
            useful, like age range, level, and accessibility support).
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {hasFilters && (
            <p
              className="text-sm text-oa-grey-600"
              role="status"
              aria-live="polite"
            >
              Showing feeds that match your filters above.
            </p>
          )}
          {error ? (
            <ErrorBanner
              heading="Couldn't load feed quality."
              message={error}
              onRetry={retry}
            />
          ) : !showSkeleton && counts.total === 0 ? (
            hasFilters ? <NoMatchesState /> : <EmptyState />
          ) : (
            <>
              <FeedQualitySummary {...counts} loading={showSkeleton} />
              <div className="flex">
                <FeedQualityViewToggle value={view} onChange={setView} />
              </div>
              <FeedQualityTable
                groups={groups}
                view={view}
                loading={showSkeleton}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-sm bg-white p-8 text-center ring-1 ring-oa-grey-200">
      <p className="text-base font-semibold text-oa-navy">
        No feed quality data yet.
      </p>
      <p className="mt-1 text-sm text-oa-grey-600">
        OpenActive hasn&apos;t assessed any feeds in this window. Check back
        once publishers have started shipping data.
      </p>
    </div>
  );
}

function NoMatchesState() {
  return (
    <div className="rounded-sm bg-white p-8 text-center ring-1 ring-oa-grey-200">
      <p className="text-base font-semibold text-oa-navy">
        No feeds match your current filters.
      </p>
      <p className="mt-1 text-sm text-oa-grey-600">
        Try removing a filter above to widen the search.
      </p>
    </div>
  );
}
