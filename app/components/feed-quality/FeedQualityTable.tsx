"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FeedQualityColourKey } from "./FeedQualityColourKey";
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
  getGroupActivityCount,
  getGroupQualityScore,
  type FeedQualityGroup,
} from "../../lib/feed-quality";
import type { FeedStatus } from "../../types/feed-quality";

interface FeedQualityTableProps {
  groups: FeedQualityGroup[];
}

const PAGE_SIZE = 10;

interface Column {
  key: string;
  label: string;
  srOnly?: boolean;
  align: "left" | "center" | "right";
  // Tooltip shown on the column header for sighted users.
  hint?: string;
}

const COLUMNS: Column[] = [
  { key: "status", label: "Status", srOnly: true, align: "center" },
  { key: "feed", label: "Feed", align: "left" },
  {
    key: "start_date",
    label: "Start date",
    align: "center",
    hint: "% of future items with a start date",
  },
  {
    key: "end_date",
    label: "End date",
    align: "center",
    hint: "% of future items with an end date",
  },
  {
    key: "location",
    label: "Location",
    align: "center",
    hint: "% of future items with a geographic location",
  },
  {
    key: "activity",
    label: "Activity / Facility",
    align: "center",
    hint: "% of future items naming an activity or facility",
  },
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

export function FeedQualityTable({ groups }: FeedQualityTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("quality-best");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
            getGroupQualityScore(b) - getGroupQualityScore(a) || byName(a, b)
        );
      case "activities-most":
        return arr.sort(
          (a, b) =>
            getGroupActivityCount(b) - getGroupActivityCount(a) || byName(a, b)
        );
      default:
        // Unreachable — every SortKey is handled above. Fallback returns
        // the un-sorted array so the function always has a return value.
        return arr;
    }
  }, [filteredGroups, sortKey]);

  // Reset paging whenever any filter or sort changes so users always see
  // matches from the top of the new view.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query, statusFilter, sortKey]);

  const visibleGroups = sortedGroups.slice(0, visibleCount);
  const hasMore = visibleCount < sortedGroups.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  // Auto-load when the sentinel scrolls into the inner table area; the button
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex w-full max-w-sm items-center gap-2 rounded-sm border border-oa-grey-300 bg-white px-3 py-2 focus-within:border-oa-cyan focus-within:ring-1 focus-within:ring-oa-cyan">
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

        {/* ml-auto on the first right-side item pushes everything after it
            against the right edge — sort, colour key, collapse toggle. */}
        <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-2">
          <FeedQualitySortSelect value={sortKey} onChange={setSortKey} />
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

      {filteredGroups.length === 0 ? (
        <p className="rounded-sm bg-white p-6 text-center text-sm text-oa-grey-600 ring-1 ring-oa-grey-200">
          {query
            ? `No publishers match "${query}"${
                statusFilter !== "all" ? " in this status" : ""
              }.`
            : "No publishers in this status."}
        </p>
      ) : (
        <div
          ref={scrollRef}
          className="max-h-[40rem] overflow-auto rounded-sm bg-white ring-1 ring-oa-grey-200"
        >
          <table id="feed-quality-table" className="w-full border-collapse">
            <caption className="sr-only">
              Feed quality by publisher. Each row shows a single feed&apos;s
              completeness for the fields that decide whether its opportunities
              count in OpenActive&apos;s headline figures.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr>
                {COLUMNS.map((col) => (
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
                collapsed={collapsed.has(group.datasetUrl)}
                onToggle={() => toggle(group.datasetUrl)}
                columnCount={COLUMNS.length}
              />
            ))}
          </table>
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
