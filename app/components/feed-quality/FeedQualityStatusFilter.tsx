"use client";

import {
  forwardRef,
  useRef,
  type KeyboardEvent,
  type Ref,
  type RefObject,
} from "react";
import { STATUS_DOT_CLASS, STATUS_LABELS } from "../../lib/feed-quality";
import { FEED_STATUSES, type FeedStatus } from "../../types/feed-quality";

export type StatusFilter = FeedStatus | "all";

const FILTER_VALUES: StatusFilter[] = ["all", ...FEED_STATUSES];

const HORIZONTAL_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

interface FeedQualityStatusFilterProps {
  value: StatusFilter;
  onChange: (next: StatusFilter) => void;
  counts: Record<FeedStatus, number>;
  total: number;
  loading?: boolean;
  groupRef?: RefObject<HTMLDivElement | null>;
  onFocusSearch?: () => void;
  onFocusSort?: () => void;
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
  groupRef,
  onFocusSearch,
  onFocusSort,
}: FeedQualityStatusFilterProps) {
  const chipRefs = useRef<Record<StatusFilter, HTMLButtonElement | null>>({
    all: null,
    OK: null,
    WARNING: null,
    ERROR: null,
  });

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onFocusSearch?.();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onFocusSort?.();
      return;
    }

    if (event.key === "ArrowLeft" && index === 0) {
      event.preventDefault();
      onFocusSearch?.();
      return;
    }

    if (event.key === "ArrowRight" && index === FILTER_VALUES.length - 1) {
      event.preventDefault();
      onFocusSort?.();
      return;
    }

    if (!HORIZONTAL_KEYS.has(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % FILTER_VALUES.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + FILTER_VALUES.length) % FILTER_VALUES.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = FILTER_VALUES.length - 1;
    }

    const nextValue = FILTER_VALUES[nextIndex];
    onChange(nextValue);
    chipRefs.current[nextValue]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label="Filter data streams by status"
      className="no-scrollbar relative -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <Chip
        ref={(element) => {
          chipRefs.current.all = element;
        }}
        label="All"
        count={total}
        active={value === "all"}
        tabIndex={value === "all" ? 0 : -1}
        onClick={() => onChange("all")}
        onKeyDown={(event) => onKeyDown(event, 0)}
        loading={loading}
      />
      {FEED_STATUSES.map((status, statusIndex) => (
        <Chip
          key={status}
          ref={(element) => {
            chipRefs.current[status] = element;
          }}
          label={FILTER_LABELS[status]}
          count={counts[status]}
          dotClass={STATUS_DOT_CLASS[status]}
          active={value === status}
          tabIndex={value === status ? 0 : -1}
          onClick={() => onChange(status)}
          onKeyDown={(event) => onKeyDown(event, statusIndex + 1)}
          srHint={STATUS_LABELS[status]}
          loading={loading}
        />
      ))}
    </div>
  );
}

const Chip = forwardRef(function Chip(
  {
    label,
    count,
    dotClass,
    active,
    tabIndex,
    onClick,
    onKeyDown,
    srHint,
    loading,
  }: {
    label: string;
    count: number;
    dotClass?: string;
    active: boolean;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
    srHint?: string;
    loading?: boolean;
  },
  ref: Ref<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
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
});
