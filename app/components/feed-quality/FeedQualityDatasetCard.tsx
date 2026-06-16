"use client";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityFeedCard } from "./FeedQualityFeedCard";
import { STATUS_DOT_CLASS, type FeedQualityGroup } from "../../lib/feed-quality";

interface FeedQualityDatasetCardProps {
  group: FeedQualityGroup;
  collapsed: boolean;
  onToggle: () => void;
}

export function FeedQualityDatasetCard({
  group,
  collapsed,
  onToggle,
}: FeedQualityDatasetCardProps) {
  const wrapClass =
    "overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-oa-grey-200";

  // Single-feed groups merge the publisher header into the feed card itself,
  // matching how the desktop table avoids a header row for one-feed datasets.
  if (group.feeds.length === 1) {
    return (
      <section className={wrapClass} aria-label={group.datasetName}>
        <FeedQualityFeedCard
          feed={group.feeds[0]}
          dataset={{
            name: group.datasetName,
            url: group.datasetUrl,
            worstStatus: group.worstStatus,
          }}
        />
      </section>
    );
  }

  return (
    <section className={wrapClass} aria-label={group.datasetName}>
      <header className="flex items-center gap-2 bg-oa-grey-50 px-4 py-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="cursor-pointer rounded-sm p-0.5 hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
        >
          <ChevronDownIcon
            aria-hidden="true"
            className={`h-4 w-4 text-oa-grey-500 motion-safe:transition-transform ${
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
        <span className="ml-auto text-xs font-medium text-oa-grey-500">
          {group.feeds.length} feeds
        </span>
      </header>

      {!collapsed && (
        <div className="divide-y divide-oa-grey-200">
          {group.feeds.map((feed) => (
            <FeedQualityFeedCard key={feed.feed_url} feed={feed} />
          ))}
        </div>
      )}
    </section>
  );
}
