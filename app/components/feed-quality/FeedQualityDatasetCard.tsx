"use client";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityFeedCard } from "./FeedQualityFeedCard";
import { useFeedQualityRowNavKeyDown } from "./FeedQualityTableNavContext";
import {
  STATUS_DOT_CLASS,
  formatDataStreamCount,
  type FeedQualityGroup,
  type FeedQualityView,
} from "../../lib/feed-quality";
import { FEED_QUALITY_NAV_ATTR } from "../../lib/feed-quality-table-nav";

interface FeedQualityDatasetCardProps {
  group: FeedQualityGroup;
  view: FeedQualityView;
  collapsed: boolean;
  onToggle: () => void;
}

export function FeedQualityDatasetCard({
  group,
  view,
  collapsed,
  onToggle,
}: FeedQualityDatasetCardProps) {
  const onRowNavKeyDown = useFeedQualityRowNavKeyDown();

  return (
    <section
      className="overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-oa-grey-200"
      aria-label={group.datasetName}
    >
      <header
        onClick={onToggle}
        className="cursor-pointer bg-oa-grey-100 px-4 py-3 transition-colors hover:bg-oa-grey-200/70"
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            onKeyDown={onRowNavKeyDown}
            {...{ [FEED_QUALITY_NAV_ATTR]: true }}
            aria-expanded={!collapsed}
            className="mt-0.5 cursor-pointer rounded-sm p-0.5 hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
          >
            <ChevronDownIcon
              aria-hidden="true"
              className={`h-4 w-4 text-oa-grey-600 motion-safe:transition-transform ${
                collapsed ? "-rotate-90" : ""
              }`}
            />
            <span className="sr-only">
              {collapsed ? "Show" : "Hide"} data streams for {group.datasetName}
            </span>
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[group.worstStatus]}`}
              />
              <span
                className="min-w-0"
                onClick={(event) => event.stopPropagation()}
              >
                <ExternalDataLink
                  href={group.datasetUrl}
                  label={group.datasetName}
                  className="text-sm font-semibold text-oa-navy"
                />
              </span>
            </div>
            <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-oa-grey-600 ring-1 ring-oa-grey-200">
              {formatDataStreamCount(group.feeds.length)}
            </span>
          </div>
        </div>
      </header>

      {!collapsed && (
        <div className="divide-y divide-oa-grey-100 bg-white">
          {group.feeds.map((feed) => (
            <FeedQualityFeedCard key={feed.feed_url} feed={feed} view={view} />
          ))}
        </div>
      )}
    </section>
  );
}
