"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FeedQualityColourKey } from "./FeedQualityColourKey";
import { FeedQualityDatasetCard } from "./FeedQualityDatasetCard";
import { FeedQualityDatasetGroup } from "./FeedQualityDatasetGroup";
import { FeedQualityTableNavProvider } from "./FeedQualityTableNavContext";
import {
  FeedQualitySortSelect,
  type SortKey,
} from "./FeedQualitySortSelect";
import {
  FeedQualityStatusFilter,
  type StatusFilter,
} from "./FeedQualityStatusFilter";
import {
  STATUS_RANK,
  VIEW_CONFIGS,
  getGroupActivityCount,
  type FeedQualityGroup,
  type FeedQualityView,
} from "../../lib/feed-quality";
import { COLUMN_GLOSSARY } from "../../lib/feed-quality-glossary";
import { focusFirstFeedQualityNav } from "../../lib/feed-quality-table-nav";
import type { FeedStatus } from "../../types/feed-quality";
import { ColumnGlossaryIcon } from "./feed-quality-glossary-ui";

interface FeedQualityTableProps {
  groups: FeedQualityGroup[];
  view: FeedQualityView;
  // While true, keep the toolbar and column head visible but swap the rows
  // (and the status-chip counts) for placeholders. Used while a new filter
  // combination loads so the static controls don't flash or disappear.
  loading?: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onFocusViewToggle?: () => void;
}

const PAGE_SIZE = 10;

interface Column {
  key: string;
  label: string;
  srOnly?: boolean;
  align: "left" | "center" | "right";
  hint?: string;
}

const STATIC_LEFT_COLUMNS: Column[] = [
  { key: "status", label: "Status", srOnly: true, align: "center" },
  { key: "feed", label: COLUMN_GLOSSARY.feed.label, align: "left" },
];

const STATIC_RIGHT_COLUMNS: Column[] = [
  {
    key: "items",
    label: COLUMN_GLOSSARY.items.label,
    align: "right",
    hint: COLUMN_GLOSSARY.items.definition,
  },
  {
    key: "updated",
    label: "Last assessed",
    align: "left",
    hint: COLUMN_GLOSSARY.updated.definition,
  },
];

function buildColumns(view: FeedQualityView): Column[] {
  const config = VIEW_CONFIGS[view];
  return [
    ...STATIC_LEFT_COLUMNS,
    {
      key: "quality",
      label: "Completeness",
      align: "center",
      hint: config.qualityHint,
    },
    ...config.completenessColumns.map((col) => ({
      key: col.key,
      label: col.label,
      align: "center" as const,
      hint: col.hint,
    })),
    ...STATIC_RIGHT_COLUMNS,
  ];
}

export function FeedQualityTable({
  groups,
  view,
  loading = false,
  searchInputRef,
  onFocusViewToggle,
}: FeedQualityTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("quality-best");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const sortWrapRef = useRef<HTMLDivElement>(null);
  const colourKeyButtonRef = useRef<HTMLButtonElement>(null);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();

  const focusSearch = useCallback(() => {
    searchInputRef?.current?.focus();
  }, [searchInputRef]);

  const focusActiveStatusChip = useCallback(() => {
    statusFilterRef.current
      ?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
      ?.focus();
  }, []);

  const focusSortTrigger = useCallback(() => {
    sortWrapRef.current
      ?.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]')
      ?.focus();
  }, []);

  const focusColourKey = useCallback(() => {
    colourKeyButtonRef.current?.focus();
  }, []);

  const focusCollapseToggle = useCallback(() => {
    collapseButtonRef.current?.focus();
  }, []);

  const focusFirstTableRow = useCallback(() => {
    focusFirstFeedQualityNav(scrollRef.current);
  }, []);

  const columns = useMemo(() => buildColumns(view), [view]);
  const getGroupScore = VIEW_CONFIGS[view].getGroupScore;

  // Counts run on the unfiltered groups so the chips always show the totals,
  // not the filtered subset (otherwise switching to "Errors" hides the others).
  const statusCounts = useMemo(() => {
    const counts: Record<FeedStatus, number> = { OK: 0, WARNING: 0, ERROR: 0 };
    for (const group of groups) counts[group.worstStatus] += 1;
    return counts;
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (statusFilter !== "all" && g.worstStatus !== statusFilter) return false;
      if (trimmed && !g.datasetName.toLowerCase().includes(trimmed)) return false;
      return true;
    });
  }, [groups, query, statusFilter]);

  const sortedGroups = useMemo(() => {
    const arr = [...filteredGroups];
    const byName = (a: FeedQualityGroup, b: FeedQualityGroup) =>
      a.datasetName.localeCompare(b.datasetName);
    switch (sortKey) {
      case "name-asc":
        return arr.sort(byName);
      case "name-desc":
        return arr.sort((a, b) => b.datasetName.localeCompare(a.datasetName));
      case "status-worst":
        return arr.sort(
          (a, b) =>
            STATUS_RANK[b.worstStatus] - STATUS_RANK[a.worstStatus] ||
            byName(a, b)
        );
      case "updated-newest": {
        // A group has many feeds — use its most recent assessment as the
        // group-level recency so a stale feed doesn't drag the whole row down.
        const latest = (g: FeedQualityGroup) =>
          g.feeds.reduce(
            (max, f) => Math.max(max, new Date(f.last_assessed).getTime()),
            0
          );
        return arr.sort((a, b) => latest(b) - latest(a) || byName(a, b));
      }
      case "quality-best":
        // Best average completeness first; unassessable groups (-1) sink to
        // the bottom. Tie-break alphabetically so stable visually.
        return arr.sort(
          (a, b) =>
            getGroupScore(b) - getGroupScore(a) || byName(a, b)
        );
      case "activities-most":
        return arr.sort(
          (a, b) =>
            getGroupActivityCount(b) - getGroupActivityCount(a) || byName(a, b)
        );
      default:
        // Unreachable — TypeScript narrows SortKey above, but the default
        // keeps the function returning a value if the union ever widens.
        return arr;
    }
  }, [filteredGroups, sortKey, getGroupScore]);

  // Reset paging whenever any filter, sort, or view changes so users always see
  // matches from the top of the new view.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query, statusFilter, sortKey, view]);

  const visibleGroups = sortedGroups.slice(0, visibleCount);
  const hasMore = visibleCount < sortedGroups.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  // Auto-load when the sentinel scrolls into view; the button
  // below is the keyboard / screen-reader fallback for users who never scroll.
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: scrollRef.current, rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const toggle = useCallback((datasetUrl: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(datasetUrl)) next.delete(datasetUrl);
      else next.add(datasetUrl);
      return next;
    });
  }, []);

  // True when nothing is collapsed; flipping then collapses everything visible.
  const allExpanded = collapsed.size === 0;
  const collapseToggle = useCallback(() => {
    setCollapsed(allExpanded ? new Set(groups.map((g) => g.datasetUrl)) : new Set());
  }, [allExpanded, groups]);

  const hasActiveFilters = query.trim() !== "" || statusFilter !== "all";
  const clearFilters = useCallback(() => {
    setQuery("");
    setStatusFilter("all");
  }, []);

  // Plain-English summary for the live region. Repeats whatever the user
  // currently sees so screen readers know if their filter actually matched.
  const liveMessage = useMemo(() => {
    const count = filteredGroups.length;
    const noun = count === 1 ? "data stream" : "data streams";
    if (!hasActiveFilters) return "";
    return count === 0
      ? "No data streams match the current filters."
      : `${count} ${noun} match the current filters.`;
  }, [filteredGroups.length, hasActiveFilters]);

  // Size the loading skeleton to the rows currently on screen so swapping the real content for placeholders doesn't resize the box.
  const skeletonRowCount = (() => {
    if (visibleGroups.length === 0) return 18;
    let rows = 0;
    for (const group of visibleGroups) {
      rows += 1 + (collapsed.has(group.datasetUrl) ? 0 : group.feeds.length);
    }
    return Math.min(rows, 30);
  })();
  const skeletonCardCount =
    visibleGroups.length === 0 ? 6 : Math.min(visibleGroups.length, 12);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3 lg:gap-y-2">
        <label
          htmlFor={searchId}
          className="flex w-full items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 focus-within:border-oa-cyan focus-within:ring-1 focus-within:ring-oa-cyan lg:max-w-sm"
        >
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-oa-grey-500"
          />
          <span className="sr-only">Search data providers by name</span>
          <input
            ref={searchInputRef}
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onFocusViewToggle?.();
                return;
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusActiveStatusChip();
                return;
              }
              if (event.key === "ArrowRight") {
                const input = event.currentTarget;
                const atEnd =
                  input.selectionStart === input.value.length &&
                  input.selectionEnd === input.value.length;
                if (atEnd) {
                  event.preventDefault();
                  focusActiveStatusChip();
                }
              }
            }}
            placeholder="Search data providers"
            className="w-full bg-transparent text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:outline-none"
            aria-controls="feed-quality-table"
          />
        </label>

        <FeedQualityStatusFilter
          groupRef={statusFilterRef}
          value={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
          total={groups.length}
          loading={loading}
          onFocusSearch={focusSearch}
          onFocusSort={focusSortTrigger}
        />

        {/* On desktop ml-auto pushes this group to the right edge; on mobile
            it owns its own row, with the colour key + collapse toggle wrapped
            into a sub-row so they sit side-by-side under the sort. */}
        <div className="flex flex-col gap-2 lg:ml-auto lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3">
          <div ref={sortWrapRef}>
            <FeedQualitySortSelect
              value={sortKey}
              onChange={setSortKey}
              toolbarNav={{
                onArrowUp: focusActiveStatusChip,
                onArrowDown: focusColourKey,
                onArrowLeft: focusActiveStatusChip,
                onArrowRight: focusColourKey,
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <FeedQualityColourKey
              buttonRef={colourKeyButtonRef}
              onFocusSort={focusSortTrigger}
              onFocusCollapse={focusCollapseToggle}
            />
            <button
              ref={collapseButtonRef}
              type="button"
              onClick={collapseToggle}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusFirstTableRow();
                  return;
                }
                if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  focusColourKey();
                }
              }}
              aria-pressed={!allExpanded}
              className="cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold text-oa-blue underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>
      </div>

      {/* Politely announce result counts to assistive tech when filters
          change. Sighted users see the table change directly, so this stays
          visually hidden. */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      {!loading && filteredGroups.length === 0 ? (
        <div className="rounded-sm bg-white p-8 text-center ring-1 ring-oa-grey-200">
          <p className="text-base font-semibold text-oa-navy">
            No data streams match those filters.
          </p>
          <p className="mt-1 text-sm text-oa-grey-600">
            {query
              ? `Nothing matches "${query}"${
                  statusFilter !== "all"
                    ? ` in the ${statusFilter === "OK" ? "Healthy" : statusFilter === "WARNING" ? "Warnings" : "Errors"} status`
                    : ""
                }.`
              : "Try a different status or clear the search."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex cursor-pointer items-center rounded-sm border border-oa-navy px-3 py-1.5 text-xs font-semibold text-oa-navy hover:bg-oa-navy hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <FeedQualityTableNavProvider
          containerRef={scrollRef}
          onArrowUpFromFirst={focusCollapseToggle}
        >
          <div
            ref={scrollRef}
            className="relative max-h-160 overflow-auto scrollbar-gutter-stable overscroll-contain rounded-sm bg-oa-grey-50 p-2 lg:bg-white lg:p-0 lg:ring-1 lg:ring-oa-grey-200"
          >
          <table
            id="feed-quality-table"
            className="hidden w-full border-collapse lg:table"
          >
            <caption className="sr-only">
              {VIEW_CONFIGS[view].label} by data provider. Each row shows a single
              data stream&apos;s completeness for the relevant fields.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`bg-oa-navy px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {col.srOnly ? (
                      <span className="sr-only">{col.label}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 align-middle">
                        {col.label}
                        <ColumnGlossaryIcon colKey={col.key} dark />
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {loading
              ? <FeedRowsSkeleton columnCount={columns.length} rows={skeletonRowCount} />
              : visibleGroups.map((group) => (
                  <FeedQualityDatasetGroup
                    key={group.datasetUrl}
                    group={group}
                    view={view}
                    collapsed={collapsed.has(group.datasetUrl)}
                    onToggle={() => toggle(group.datasetUrl)}
                    columnCount={columns.length}
                  />
                ))}
          </table>

          <div
            className={`space-y-3 lg:hidden ${
              loading ? "motion-safe:animate-pulse" : ""
            }`}
          >
            {loading
              ? Array.from({ length: skeletonCardCount }).map((_, i) => (
                  <FeedCardSkeleton key={i} />
                ))
              : visibleGroups.map((group) => (
                  <FeedQualityDatasetCard
                    key={group.datasetUrl}
                    group={group}
                    view={view}
                    collapsed={collapsed.has(group.datasetUrl)}
                    onToggle={() => toggle(group.datasetUrl)}
                  />
                ))}
          </div>

          {hasMore && !loading && (
            <div
              ref={sentinelRef}
              role="status"
              aria-live="polite"
              className="px-3 py-3 text-center text-xs text-oa-grey-500"
            >
              Loading more data streams…
            </div>
          )}
          </div>
        </FeedQualityTableNavProvider>
      )}
    </div>
  );
}

// Placeholder table bodies shown while a new filter combination loads. Mirrors
// the grouped header + nested child row layout.
function FeedRowsSkeleton({
  columnCount,
  rows,
}: {
  columnCount: number;
  rows: number;
}) {
  const feedWidths = ["w-40", "w-52", "w-44", "w-36", "w-48"];
  const groups: number[] = [];
  let remaining = rows;

  while (remaining > 0) {
    groups.push(1);
    remaining--;
    const children = Math.min(3, remaining);
    if (children > 0) {
      groups[groups.length - 1] += children;
      remaining -= children;
    }
  }

  let rowOffset = 0;
  return (
    <>
      {groups.map((groupRows, groupIndex) => {
        const childRows = groupRows - 1;
        const tbody = (
          <tbody
            key={groupIndex}
            className="motion-safe:animate-pulse border-t-2 border-oa-grey-200"
          >
            <tr className="bg-oa-grey-100">
              <td colSpan={columnCount} className="px-3 py-3">
                <div className="h-3.5 w-48 max-w-full rounded bg-oa-grey-200" />
              </td>
            </tr>
            {Array.from({ length: childRows }).map((_, row) => {
              const width = feedWidths[(rowOffset + row) % feedWidths.length];
              return (
                <tr key={row} className="border-t border-oa-grey-100 bg-white">
                  <td className="px-3 py-2.5">
                    <div className="mx-auto h-5 w-5 rounded-full bg-oa-grey-200" />
                  </td>
                  <td className="border-l-2 border-oa-grey-200 px-3 py-2.5">
                    <div
                      className={`ml-5 h-3.5 max-w-full rounded bg-oa-grey-200 ${width}`}
                    />
                  </td>
                  {Array.from({ length: Math.max(0, columnCount - 2) }).map(
                    (_, cell) => (
                      <td key={cell} className="px-3 py-2.5">
                        <div className="mx-auto h-3.5 w-10 rounded bg-oa-grey-100" />
                      </td>
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        );
        rowOffset += childRows;
        return tbody;
      })}
    </>
  );
}

// Placeholder card for the mobile layout, mirroring FeedQualityDatasetCard.
function FeedCardSkeleton() {
  return (
    <div className="space-y-3 rounded-sm bg-white p-4 ring-1 ring-oa-grey-200">
      <div className="h-3 w-32 rounded bg-oa-grey-200" />
      <div className="h-5 w-5 rounded-full bg-oa-grey-200" />
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-sm bg-oa-grey-100" />
        ))}
      </div>
      <div className="h-3 w-24 rounded bg-oa-grey-200" />
    </div>
  );
}
