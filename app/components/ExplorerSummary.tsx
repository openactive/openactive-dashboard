"use client";

import { useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDoubleDownIcon,
} from "@heroicons/react/20/solid";
import { formatFullNumber, formatNumber } from "../lib/format";
import { type ExplorerSummary as ExplorerSummaryData } from "../lib/explore-filters";
import { ExplorerDetailsModal } from "./ExplorerDetailsModal";

type SummaryLayout = "panel" | "sheet";

interface ExplorerSummaryProps {
  summary: ExplorerSummaryData;
  selectionLabel: string;
  layout?: SummaryLayout;
  /** When true, replace numbers with skeletons so users don't read stale values. */
  isLoading?: boolean;
  /**
   * Called just before a CTA scrolls/navigates away from the summary.
   * Used by the mobile bottom sheet to close itself first so the records
   * section isn't covered when the user lands on it.
   */
  onNavigateAway?: () => void;
}

/** Inline breakdown row: label left, big number right. */
function StatRow({
  label,
  value,
  sub,
  isLoading,
}: {
  label: string;
  value: number;
  sub?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-oa-grey-800">
          {label}
        </p>
        {sub && <p className="mt-0.5 text-xs text-oa-grey-600">{sub}</p>}
      </div>
      {isLoading ? (
        <span
          className="inline-block h-4 w-10 shrink-0 animate-pulse rounded bg-oa-grey-200"
          aria-hidden="true"
        />
      ) : (
        <p className="shrink-0 text-base font-bold tabular-nums text-oa-navy">
          <span aria-hidden="true">{formatNumber(value)}</span>
          <span className="sr-only">{formatFullNumber(value)}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Compact summary for the data explorer.
 *
 * Two layouts:
 *  - `panel`: sits beside the map on desktop. Designed to fit without
 *    scrolling — the rich detail (top activities, full breakdown) lives
 *    behind the "View the data" button which opens a modal.
 *  - `sheet`: rendered inside the mobile bottom-sheet.
 *
 * All metrics come from the live `/opportunities` response, so the card
 * always agrees with the map.
 */
export function ExplorerSummary({
  summary,
  selectionLabel,
  layout = "panel",
  isLoading = false,
  onNavigateAway,
}: ExplorerSummaryProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const total = summary.totalOpportunities;
  const headlineLabel = `${formatFullNumber(total)} future opportunities`;
  const showViewData = !isLoading && total > 0;

  const containerClass =
    layout === "panel"
      ? "flex h-full flex-col overflow-hidden rounded-xl border border-oa-grey-200 bg-white shadow-[0_8px_32px_rgba(34,53,130,0.08)]"
      : "flex flex-col";

  /**
   * Smooth-scroll to the records section and move focus to its heading
   * so keyboard and screen-reader users land in the same place sighted
   * users do. Honours prefers-reduced-motion by jumping instantly.
   */
  const scrollToRecords = () => {
    const target = document.getElementById("records");
    const heading = document.getElementById("records-heading");
    if (!target) return;

    onNavigateAway?.();

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });

    // Wait for the scroll to settle before stealing focus, otherwise
    // the focus call cancels the scroll animation in some browsers.
    window.setTimeout(
      () => heading?.focus({ preventScroll: true }),
      reduced ? 0 : 450
    );
  };

  return (
    <>
      <div
        className={containerClass}
        aria-live="polite"
        aria-atomic="true"
        aria-busy={isLoading || undefined}
      >
        <header
          className={
            layout === "panel"
              ? "border-b-4 border-oa-cyan bg-oa-navy px-5 py-4"
              : "pb-3"
          }
        >
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
              layout === "panel" ? "text-white/80" : "text-oa-grey-600"
            }`}
          >
            Selection
          </p>
          <p
            className={`mt-1 truncate text-lg font-bold ${
              layout === "panel" ? "text-white" : "text-oa-navy"
            }`}
            title={selectionLabel}
          >
            {selectionLabel}
          </p>
        </header>

        <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500">
            Future opportunities
          </p>
          {isLoading ? (
            <span
              className="mt-2 inline-block h-9 w-28 animate-pulse rounded bg-oa-grey-200"
              aria-label="Loading"
              role="status"
            />
          ) : (
            <p
              className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-oa-navy"
              aria-label={headlineLabel}
            >
              <span aria-hidden="true">{formatNumber(total)}</span>
            </p>
          )}

          <dl className="mt-4 divide-y divide-oa-grey-100 border-y border-oa-grey-100">
            <StatRow
              label="Physical Activity"
              value={summary.activityOpportunities}
              sub="Sessions, classes & events"
              isLoading={isLoading}
            />
            <StatRow
              label="Facility Use"
              value={summary.facilityOpportunities}
              sub="Spaces & equipment"
              isLoading={isLoading}
            />
          </dl>

          <dl className="mt-2 divide-y divide-oa-grey-100">
            <StatRow
              label="Local areas"
              value={summary.areaCount}
              isLoading={isLoading}
            />
            <StatRow
              label="Publishers"
              value={summary.publisherCount}
              isLoading={isLoading}
            />
          </dl>

          {showViewData && (
            <div className="mt-auto flex flex-col gap-2 pt-5">
              <button
                type="button"
                onClick={scrollToRecords}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-oa-blue px-4 py-2 text-sm font-semibold text-white hover:bg-oa-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
              >
                Explore the records
                <ChevronDoubleDownIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-oa-blue bg-white px-4 py-2 text-sm font-semibold text-oa-blue hover:bg-oa-blue hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
                aria-haspopup="dialog"
                aria-expanded={detailsOpen}
              >
                View the data
                <ArrowTopRightOnSquareIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <ExplorerDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        summary={summary}
        selectionLabel={selectionLabel}
      />
    </>
  );
}
