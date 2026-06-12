"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FeedQualityDatasetGroup } from "./FeedQualityDatasetGroup";
import type { FeedQualityGroup } from "../../lib/feed-quality";

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return groups;
    return groups.filter((g) => g.datasetName.toLowerCase().includes(trimmed));
  }, [groups, query]);

  // Reset paging whenever the filter changes so users always see matches from the top.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  const visibleGroups = filteredGroups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGroups.length;

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

  return (
    <div>
      <div className="pb-3">
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
      </div>

      {filteredGroups.length === 0 ? (
        <p className="rounded-sm bg-white p-6 text-center text-sm text-oa-grey-600 ring-1 ring-oa-grey-200">
          No publishers match &ldquo;{query}&rdquo;.
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
