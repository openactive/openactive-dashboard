"use client";

import { ChartBarIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../lib/format";
import {
  EXPLORER_SUMMARY_METRIC_DEFS,
  EXPLORER_SUMMARY_METRIC_KEYS,
  type ExplorerSummary,
} from "../../lib/explore-filters";
import type { MobilePanel } from "../../lib/explorer-types";

const METRICS = EXPLORER_SUMMARY_METRIC_KEYS.map((key) => ({
  key,
  label: EXPLORER_SUMMARY_METRIC_DEFS[key].mobileLabel,
}));

interface ExplorerMobileStatsDockProps {
  panel: MobilePanel;
  summary: ExplorerSummary;
  selectionLabel: string;
  onOpenStats: () => void;
  isLoading?: boolean;
}

export function ExplorerMobileStatsDock({
  panel,
  summary,
  selectionLabel,
  onOpenStats,
  isLoading,
}: ExplorerMobileStatsDockProps) {
  return (
    <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-auto">
      <section
        className="border-t border-oa-grey-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(34,53,130,0.08)]"
        aria-label="Selection summary"
        aria-busy={isLoading || undefined}
      >
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-oa-grey-500">
              {selectionLabel}
            </p>
            {isLoading ? (
              <span
                className="mt-1 inline-block h-7 w-20 animate-pulse rounded bg-oa-grey-200"
                aria-label="Loading"
                role="status"
              />
            ) : (
              <p
                className="text-3xl font-bold tabular-nums leading-none text-oa-navy"
                aria-label={`${formatNumber(summary.totalOpportunities)} future opportunities`}
              >
                {formatNumber(summary.totalOpportunities)}
              </p>
            )}
            <p className="mt-0.5 text-xs font-medium text-oa-grey-600">
              Future opportunities
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenStats}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-oa-grey-200 bg-oa-grey-50 px-3 py-2.5 text-xs font-semibold text-oa-navy hover:border-oa-cyan focus:outline-none focus:ring-2 focus:ring-oa-cyan/30"
            aria-expanded={panel === "stats"}
            aria-controls="explorer-stats-sheet"
          >
            <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
            Details
          </button>
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-oa-grey-100 pt-3">
          {METRICS.map(({ key, label }) => (
            <div key={key} className="text-center">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-oa-grey-500">
                {label}
              </dt>
              <dd className="text-sm font-bold tabular-nums text-oa-navy">
                {isLoading ? (
                  <span
                    className="inline-block h-3.5 w-8 animate-pulse rounded bg-oa-grey-200"
                    aria-hidden="true"
                  />
                ) : (
                  formatNumber(summary[key])
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
