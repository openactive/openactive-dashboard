"use client";

import { useCallback, useState } from "react";
import { FeedQualityDatasetGroup } from "./FeedQualityDatasetGroup";
import type { FeedQualityGroup } from "../../lib/feed-quality";

interface FeedQualityTableProps {
  groups: FeedQualityGroup[];
}

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

  const toggle = useCallback((datasetUrl: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(datasetUrl)) next.delete(datasetUrl);
      else next.add(datasetUrl);
      return next;
    });
  }, []);

  return (
    <div className="overflow-x-auto rounded-sm bg-white shadow-sm ring-1 ring-oa-grey-200">
      <table className="w-full border-collapse">
        <caption className="sr-only">
          Feed quality by publisher. Each row shows a single feed&apos;s
          completeness for the fields that decide whether its opportunities
          count in OpenActive&apos;s headline figures.
        </caption>
        <thead>
          <tr className="bg-oa-navy text-white">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                title={col.hint}
                className={`px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] ${
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {col.srOnly ? <span className="sr-only">{col.label}</span> : col.label}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => (
          <FeedQualityDatasetGroup
            key={group.datasetUrl}
            group={group}
            collapsed={collapsed.has(group.datasetUrl)}
            onToggle={() => toggle(group.datasetUrl)}
            columnCount={COLUMNS.length}
          />
        ))}
      </table>
    </div>
  );
}
