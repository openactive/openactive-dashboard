"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFeedQuality } from "../../hooks/useFeedQuality";
import { ErrorBanner } from "../ErrorBanner";
import { FeedQualitySummary } from "./FeedQualitySummary";

export function FeedQualitySection() {
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
      { rootMargin: "200px" }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [enabled]);

  const { rows, isLoading, error, retry } = useFeedQuality(enabled);

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

  return (
    <section
      ref={sectionRef}
      id="feed-quality"
      tabIndex={-1}
      className="scroll-mt-4 bg-white py-16 sm:py-20"
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
            See how each publisher&apos;s feeds measure against the fields that
            decide whether their opportunities count in OpenActive&apos;s
            headline figures: date, location, and activity or facility.
            Provider quality coming soon.
          </p>
        </header>

        <div className="mt-10">
          {!enabled || isLoading ? (
            <SummarySkeleton />
          ) : error ? (
            <ErrorBanner
              heading="Couldn't load feed quality."
              message={error}
              onRetry={retry}
            />
          ) : counts.total === 0 ? (
            <EmptyState />
          ) : (
            <FeedQualitySummary {...counts} />
          )}
        </div>
      </div>
    </section>
  );
}

function SummarySkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading feed status"
      className="rounded-sm bg-white p-6 shadow-sm ring-1 ring-oa-grey-200 sm:p-7 animate-pulse"
    >
      <div className="h-3 w-24 rounded bg-oa-grey-200" />
      <div className="mt-3 h-10 w-32 rounded bg-oa-grey-200" />
      <div className="mt-5 h-2.5 w-full rounded-full bg-oa-grey-100" />
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-3 w-20 rounded bg-oa-grey-200" />
            <div className="mt-2 h-3 w-16 rounded bg-oa-grey-200" />
            <div className="mt-2 h-3 w-full max-w-[180px] rounded bg-oa-grey-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="rounded-2xl bg-oa-grey-50 p-6 text-sm text-oa-grey-600 ring-1 ring-oa-grey-200">
      No feeds to assess yet.
    </p>
  );
}
