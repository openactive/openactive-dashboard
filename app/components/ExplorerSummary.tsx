"use client";

import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { formatFullNumber, formatNumber } from "../lib/format";
import {
  areaMetricLabel,
  EXPLORER_SUMMARY_METRIC_DEFS,
  type ExplorerSummary as ExplorerSummaryData,
} from "../lib/explore-filters";
import { EXPLORER_GLOSSARY } from "../lib/explorer-glossary";
import { GlossaryTip } from "./feed-quality/GlossaryTip";
import { ExplorerDetailsModal } from "./ExplorerDetailsModal";

type SummaryLayout = "panel" | "sheet";

interface ExplorerSummaryProps {
  summary: ExplorerSummaryData;
  selectionLabel: string;
  layout?: SummaryLayout;
  isLoading?: boolean;
}

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
 *    behind the "View the feeds" button which opens a modal.
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
}: ExplorerSummaryProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const total = summary.totalOpportunities;
  const headlineLabel = `${formatFullNumber(total)} future opportunities`;
  const showViewData = !isLoading && total > 0;

  const containerClass =
    layout === "panel"
      ? "flex h-full flex-col overflow-hidden rounded-xl border border-oa-grey-200 bg-white shadow-[0_8px_32px_rgba(34,53,130,0.08)]"
      : "flex flex-col";

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
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500">
            Opportunities
            <GlossaryTip
              entry={EXPLORER_GLOSSARY.opportunities}
              iconClassName="h-3.5 w-3.5"
            />
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
              label="Facilities"
              value={summary.facilityOpportunities}
              sub="Spaces & equipment"
              isLoading={isLoading}
            />
          </dl>

          <dl className="mt-2 divide-y divide-oa-grey-100">
            <StatRow
              label={areaMetricLabel(summary.boundaryType)}
              value={summary.areaCount}
              isLoading={isLoading}
            />
            <StatRow
              label="Data Publishers"
              value={summary.publisherCount}
              isLoading={isLoading}
            />
            <StatRow
              label={EXPLORER_SUMMARY_METRIC_DEFS.organizationCount.desktopLabel}
              value={summary.organizationCount}
              isLoading={isLoading}
            />
            <StatRow
              label="Activities"
              value={summary.activityCount}
              isLoading={isLoading}
            />
          </dl>

          {showViewData && (
            <div className="mt-auto pt-5">
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-oa-blue bg-white px-4 py-2 text-sm font-semibold text-oa-blue hover:bg-oa-blue hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
                aria-haspopup="dialog"
                aria-expanded={detailsOpen}
              >
                View more details
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
