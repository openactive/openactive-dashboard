"use client";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityFeedRow } from "./FeedQualityFeedRow";
import { STATUS_DOT_CLASS, type FeedQualityGroup } from "../../lib/feed-quality";

interface FeedQualityDatasetGroupProps {
  group: FeedQualityGroup;
  collapsed: boolean;
  onToggle: () => void;
  // Number of columns the table renders; used by the group header to span them.
  columnCount: number;
}

export function FeedQualityDatasetGroup({
  group,
  collapsed,
  onToggle,
  columnCount,
}: FeedQualityDatasetGroupProps) {
  if (group.feeds.length === 1) {
    return (
      <tbody>
        <FeedQualityFeedRow
          feed={group.feeds[0]}
          dataset={{ name: group.datasetName, worstStatus: group.worstStatus }}
        />
      </tbody>
    );
  }

  return (
    <tbody>
      <tr className="bg-oa-grey-50">
        <th
          scope="rowgroup"
          colSpan={columnCount}
          className="px-3 py-2.5 text-left font-normal"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!collapsed}
              className="cursor-pointer rounded-sm p-0.5 hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            >
              <ChevronDownIcon
                aria-hidden="true"
                className={`h-4 w-4 text-oa-grey-500 transition-transform ${
                  collapsed ? "-rotate-90" : ""
                }`}
              />
              <span className="sr-only">
                {collapsed ? "Show" : "Hide"} feeds for {group.datasetName}
              </span>
            </button>
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[group.worstStatus]}`}
            />
            <ExternalDataLink
              href={group.datasetUrl}
              label={group.datasetName}
              className="text-sm font-semibold text-oa-navy"
            />
            <span className="text-xs font-medium text-oa-grey-500">
              {group.feeds.length} feeds
            </span>
          </div>
        </th>
      </tr>
      {!collapsed &&
        group.feeds.map((feed) => (
          <FeedQualityFeedRow key={feed.feed_url} feed={feed} />
        ))}
    </tbody>
  );
}
