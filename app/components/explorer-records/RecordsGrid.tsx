"use client";

import type { OpportunityRecord } from "../../types/opportunity-records";
import { RecordCard } from "./RecordCard";
import { RecordCardSkeleton } from "./RecordCardSkeleton";

type RecordsGridProps = {
  items: OpportunityRecord[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  selectedRecordId: string | null;
  /** Optional id of the detail drawer cards open via aria-controls. */
  detailDrawerId?: string;
  /**
   * When provided, each card receives a stable id of the form
   * `${prefix}-${feedId}-${recordId}`. Lets the parent return focus to
   * the triggering card after the drawer closes.
   */
  cardButtonIdPrefix?: string;
  onSelect: (record: OpportunityRecord) => void;
  onLoadMore: () => void;
  onRetry: () => void;
};

const SKELETON_COUNT = 8;

/** Compose a stable key — feed_id alone may collide across feeds. */
function recordKey(record: OpportunityRecord): string {
  return `${record.feed_id}:${record.id}`;
}

export function RecordsGrid({
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  selectedRecordId,
  detailDrawerId,
  cardButtonIdPrefix,
  onSelect,
  onLoadMore,
  onRetry,
}: RecordsGridProps) {
  // First load with no items yet — show a full grid of skeletons so the
  // section reserves vertical space and screen readers get a status.
  if (isLoading && items.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading records.</span>
        <ul role="list" className={GRID_CLASS}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i}>
              <RecordCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Error on first load — no items to keep on screen, so swap the grid
  // for a recoverable error block.
  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
        <p>
          <span className="font-semibold">Couldn’t load records.</span> {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-slate-200">
        No records match these filters yet. Try widening the area or
        clearing one of the dropdowns above.
      </p>
    );
  }

  return (
    <div>
      <ul role="list" className={GRID_CLASS}>
        {items.map((record) => {
          const key = recordKey(record);
          return (
            <li key={key}>
              <RecordCard
                record={record}
                isSelected={key === selectedRecordId}
                onSelect={onSelect}
                controlsId={detailDrawerId}
                buttonId={
                  cardButtonIdPrefix
                    ? `${cardButtonIdPrefix}-${record.feed_id}-${record.id}`
                    : undefined
                }
              />
            </li>
          );
        })}
        {isLoadingMore
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={`loading-${i}`} aria-hidden="true">
                <RecordCardSkeleton />
              </li>
            ))
          : null}
      </ul>

      {error && items.length > 0 ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-200"
        >
          Couldn’t load more records. {error}
        </p>
      ) : null}

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            aria-busy={isLoadingMore}
            className="cursor-pointer rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-oa-blue hover:text-oa-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "Loading…" : "Show more records"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const GRID_CLASS =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
