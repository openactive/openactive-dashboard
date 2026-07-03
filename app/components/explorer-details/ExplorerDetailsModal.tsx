"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import { formatFullNumber, formatNumber } from "../../lib/format";
import { areaMetricLabel, EXPLORER_SUMMARY_METRIC_DEFS, type ExplorerSummary } from "../../lib/explore-filters";
import { StatRow } from "./StatRow";
import { TopBreakdownTabs } from "./TopBreakdownTabs";

interface ExplorerDetailsModalProps {
  open: boolean;
  onClose: () => void;
  summary: ExplorerSummary;
  selectionLabel: string;
}

const TITLE_ID = "explorer-details-title";

/** Detail dialog opened from the explorer panel's "View the data" button. */
export function ExplorerDetailsModal({
  open,
  onClose,
  summary,
  selectionLabel,
}: ExplorerDetailsModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEscapeClose(open, onClose);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    requestAnimationFrame(() => closeRef.current?.focus());

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] items-center justify-center bg-oa-navy/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b-4 border-oa-cyan bg-oa-navy px-6 py-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              Selection details
            </p>
            <h2
              id={TITLE_ID}
              className="mt-1 truncate text-xl font-bold text-white"
              title={selectionLabel}
            >
              {selectionLabel}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-white/90 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            aria-label="Close details"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2">
            <section aria-labelledby="details-headline">
              <h3
                id="details-headline"
                className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500"
              >
                Future opportunities
              </h3>
              <p
                className="mt-1 text-5xl font-bold tabular-nums tracking-tight text-oa-navy"
                aria-label={`${formatFullNumber(summary.totalOpportunities)} future opportunities`}
              >
                <span aria-hidden="true">
                  {formatNumber(summary.totalOpportunities)}
                </span>
              </p>

              <dl className="mt-5 divide-y divide-oa-grey-100 border-y border-oa-grey-100">
                <StatRow
                  label="Physical Activity"
                  value={summary.activityOpportunities}
                  sub="Sessions, classes & events"
                />
                <StatRow
                  label="Facility Use"
                  value={summary.facilityOpportunities}
                  sub="Spaces & equipment"
                />
              </dl>
            </section>

            <section aria-labelledby="details-counts">
              <h3
                id="details-counts"
                className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500"
              >
                In this selection
              </h3>
              <dl className="mt-3 divide-y divide-oa-grey-100">
                <StatRow label={areaMetricLabel(summary.boundaryType)} value={summary.areaCount} />
                <StatRow label="Feed Publishers" value={summary.publisherCount} />
                <StatRow label="Feeds" value={summary.feedCount} />
                <StatRow label={EXPLORER_SUMMARY_METRIC_DEFS.organizationCount.desktopLabel} value={summary.organizationCount} />
                <StatRow
                  label="Activities & facilities"
                  value={summary.activityCount}
                />
              </dl>
            </section>
          </div>

          <div className="border-t border-oa-grey-100 px-6 py-6">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500">
              Top breakdowns
            </h3>
            <TopBreakdownTabs
              tabs={[
                {
                  key: "areas",
                  label: areaMetricLabel(summary.boundaryType, "short"),
                  items: summary.topAreas,
                  total: summary.areaCount,
                  barColor: "bg-oa-cyan",
                },
                {
                  key: "publishers",
                  label: "Feed Publishers",
                  items: summary.topPublishers,
                  total: summary.publisherCount,
                  barColor: "bg-oa-blue",
                },
                {
                  key: "feeds",
                  label: "Feeds",
                  items: summary.topFeeds,
                  total: summary.feedCount,
                  barColor: "bg-oa-magenta",
                },
                {
                  key: "providers",
                  label: EXPLORER_SUMMARY_METRIC_DEFS.organizationCount.desktopLabel,
                  items: summary.topOrganizations,
                  total: summary.organizationCount,
                  barColor: "bg-oa-purple",
                },
                {
                  key: "activities",
                  label: "Activities",
                  items: summary.topActivities,
                  total: summary.activityCount,
                  barColor: "bg-oa-indigo",
                },
              ]}
            />
          </div>
        </div>

        {/* Sticky footer: closes the modal and jumps the page to
            #feed-quality.  */}
        <aside
          aria-label="Check feed quality"
          className="border-t-4 border-oa-cyan bg-oa-grey-50 px-6 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <h3 className="text-sm font-bold text-oa-navy sm:text-base">
              Are these publishers shipping clean data?
            </h3>
            <a
              href="#feed-quality"
              onClick={onClose}
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-sm bg-oa-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-oa-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan focus-visible:ring-offset-2 sm:self-auto"
            >
              Check feed quality
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
