"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FeedQualityColourKey } from "./FeedQualityColourKey";
import { FeedQualityDatasetCard } from "./FeedQualityDatasetCard";
import { FeedQualityDatasetGroup } from "./FeedQualityDatasetGroup";
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
import type { FeedStatus } from "../../types/feed-quality";

interface FeedQualityTableProps {
  groups: FeedQualityGroup[];
  view: FeedQualityView;
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
  { key: "feed", label: "Feed", align: "left" },
];

const STATIC_RIGHT_COLUMNS: Column[] = [
  {
    key: "items",
    label: "Future items",
    align: "right",
    hint: "Items in this feed scheduled for the future",
  },
  {
    key: "updated",
    label: "Last assessed",
    align: "left",
    hint: "When OpenActive last ran a quality check on this feed",
  },
];

function buildColumns(view: FeedQualityView): Column[] {
  const config = VIEW_CONFIGS[view];
  return [
    ...STATIC_LEFT_COLUMNS,
    {
      key: "quality",
      label: "Quality",
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

export function FeedQualityTable({ groups, view }: FeedQualityTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("quality-best");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    const noun = count === 1 ? "publisher" : "publishers";
    if (!hasActiveFilters) return "";
    return count === 0
      ? "No publishers match the current filters."
      : `${count} ${noun} match the current filters.`;
  }, [filteredGroups.length, hasActiveFilters]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3 lg:gap-y-2">
        <label className="flex w-full items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 focus-within:border-oa-cyan focus-within:ring-1 focus-within:ring-oa-cyan lg:max-w-sm">
          <MagnifyingGlassIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-oa-grey-500"
          />
          <span className="sr-only">Search publishers by name</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search publishers"
            className="w-full bg-transparent text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:outline-none"
            aria-controls="feed-quality-table"
          />
        </label>

        <FeedQualityStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
          total={groups.length}
        />

        {/* On desktop ml-auto pushes this group to the right edge; on mobile
            it owns its own row, with the colour key + collapse toggle wrapped
            into a sub-row so they sit side-by-side under the sort. */}
        <div className="flex flex-col gap-2 lg:ml-auto lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-3">
          <FeedQualitySortSelect value={sortKey} onChange={setSortKey} />
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <FeedQualityColourKey />
            <button
              type="button"
              onClick={collapseToggle}
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

      {filteredGroups.length === 0 ? (
        <div className="rounded-sm bg-white p-8 text-center ring-1 ring-oa-grey-200">
          <p className="text-base font-semibold text-oa-navy">
            No publishers match those filters.
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
        <div
          ref={scrollRef}
          className="max-h-[40rem] overflow-auto rounded-sm bg-oa-grey-50 p-2 lg:bg-white lg:p-0 lg:ring-1 lg:ring-oa-grey-200"
        >
          <table
            id="feed-quality-table"
            className="hidden w-full border-collapse lg:table"
          >
            <caption className="sr-only">
              {VIEW_CONFIGS[view].label} by publisher. Each row shows a single
              feed&apos;s completeness for the relevant fields.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    title={col.hint}
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
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            {visibleGroups.map((group) => (
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

          <div className="space-y-3 lg:hidden">
            {visibleGroups.map((group) => (
              <FeedQualityDatasetCard
                key={group.datasetUrl}
                group={group}
                view={view}
                collapsed={collapsed.has(group.datasetUrl)}
                onToggle={() => toggle(group.datasetUrl)}
              />
            ))}
          </div>

          {hasMore && (
            <div
              ref={sentinelRef}
              className="px-3 py-3 text-center text-xs text-oa-grey-500"
            >
              Loading more publishers…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
