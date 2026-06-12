"use client";

import { STATUS_DOT_CLASS, STATUS_LABELS } from "../../lib/feed-quality";
import { FEED_STATUSES, type FeedStatus } from "../../types/feed-quality";

export type StatusFilter = FeedStatus | "all";

interface FeedQualityStatusFilterProps {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: Record<FeedStatus, number>;
  total: number;
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
}: FeedQualityStatusFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter publishers by status"
      className="flex flex-wrap items-center gap-1.5"
    >
      <Chip
        label="All"
        count={total}
        active={value === "all"}
        onClick={() => onChange("all")}
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
}: {
  label: string;
  count: number;
  dotClass?: string;
  active: boolean;
  onClick: () => void;
  srHint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan ${
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
        {count}
      </span>
    </button>
  );
}
