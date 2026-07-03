"use client";

import { STATUS_DOT_CLASS, STATUS_LABELS } from "../../lib/feed-quality";
import { FEED_STATUSES, type FeedStatus } from "../../types/feed-quality";

export type StatusFilter = FeedStatus | "all";

interface FeedQualityStatusFilterProps {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: Record<FeedStatus, number>;
  total: number;
  // While true, each chip shows a placeholder in place of its count; the
  // labels and dots stay put so the toolbar doesn't shift or disappear.
  loading?: boolean;
}

const FILTER_LABELS: Record<FeedStatus, string> = {
  OK: "Healthy",
  WARNING: "Warnings",
  ERROR: "Errors",
};

export function FeedQualityStatusFilter({
  value,
  onChange,
  counts,
  total,
  loading = false,
}: FeedQualityStatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter publishers by status"
      className="no-scrollbar relative -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <Chip
        label="All"
        count={total}
        active={value === "all"}
        onClick={() => onChange("all")}
        loading={loading}
      />
      {FEED_STATUSES.map((status) => (
        <Chip
          key={status}
          label={FILTER_LABELS[status]}
          count={counts[status]}
          dotClass={STATUS_DOT_CLASS[status]}
          active={value === status}
          onClick={() => onChange(status)}
          srHint={STATUS_LABELS[status]}
          loading={loading}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  count,
  dotClass,
  active,
  onClick,
  srHint,
  loading,
}: {
  label: string;
  count: number;
  dotClass?: string;
  active: boolean;
  onClick: () => void;
  srHint?: string;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan motion-safe:transition-colors ${
        active
          ? "border-oa-navy bg-oa-navy text-white"
          : "border-oa-grey-300 bg-white text-oa-grey-700 hover:border-oa-navy hover:text-oa-navy"
      }`}
    >
      {dotClass && (
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 rounded-full ${dotClass}`}
        />
      )}
      <span>
        {label}
        {srHint && <span className="sr-only"> ({srHint})</span>}
      </span>
      <span
        className={`rounded-full px-1.5 text-[11px] tabular-nums ${
          active ? "bg-white/20" : "bg-oa-grey-100 text-oa-grey-600"
        }`}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className={`inline-block h-2.5 w-3.5 rounded align-middle motion-safe:animate-pulse ${
              active ? "bg-white/60" : "bg-oa-grey-300"
            }`}
          />
        ) : (
          count
        )}
      </span>
    </button>
  );
}
