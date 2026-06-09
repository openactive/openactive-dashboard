import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityCell } from "./FeedQualityCell";
import { FeedQualityStatusIcon } from "./FeedQualityStatusIcon";
import {
  formatLastAssessed,
  getActivityOrFacilityCompleteness,
  humaniseFeedType,
  STATUS_DOT_CLASS,
} from "../../lib/feed-quality";
import { formatFullNumber } from "../../lib/format";
import type { FeedQualityRow, FeedStatus } from "../../types/feed-quality";

interface FeedQualityFeedRowProps {
  feed: FeedQualityRow;
  // Provided for single-feed datasets so the Feed column carries the
  // publisher name and worst-status dot inline (no group header above).
  dataset?: { name: string; worstStatus: FeedStatus };
}

export function FeedQualityFeedRow({ feed, dataset }: FeedQualityFeedRowProps) {
  const { relative, absolute } = formatLastAssessed(feed.last_assessed);
  const typeLabel = humaniseFeedType(feed.feed_type);

  return (
    <tr className="border-t border-oa-grey-200 hover:bg-oa-grey-50">
      <td className="px-3 py-2.5 text-center align-middle">
        <FeedQualityStatusIcon status={feed.status} />
      </td>

      <td className="px-3 py-2.5 align-middle">
        {dataset ? (
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_CLASS[dataset.worstStatus]}`}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <ExternalDataLink
                href={feed.dataset_url}
                label={dataset.name}
                className="text-sm font-semibold text-oa-navy"
              />
              <ExternalDataLink
                href={feed.feed_url}
                label={typeLabel}
                className="text-xs text-oa-grey-600"
              />
            </div>
          </div>
        ) : (
          <ExternalDataLink
            href={feed.feed_url}
            label={typeLabel}
            className="text-sm text-oa-grey-800"
          />
        )}
      </td>

      <FeedQualityCell value={feed.start_date_completeness} />
      <FeedQualityCell value={feed.end_date_completeness} />
      <FeedQualityCell value={feed.location_completeness} />
      <FeedQualityCell value={getActivityOrFacilityCompleteness(feed)} />

      <td className="px-3 py-2.5 text-right align-middle text-sm tabular-nums text-oa-grey-700">
        {formatFullNumber(feed.num_future_opportunity_items)}
      </td>

      <td className="px-3 py-2.5 align-middle text-xs text-oa-grey-600">
        <time dateTime={feed.last_assessed} title={absolute}>
          {relative}
        </time>
      </td>
    </tr>
  );
}
