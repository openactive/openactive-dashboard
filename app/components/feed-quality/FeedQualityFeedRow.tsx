import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityCell } from "./FeedQualityCell";
import { FeedQualityStatusButton } from "./FeedQualityStatusButton";
import { FeedVersionBadge } from "./FeedVersionBadge";
import { FeedTypeGlossaryIcon } from "./feed-quality-glossary-ui";
import {
  VIEW_CONFIGS,
  formatLastAssessed,
  getFeedStreamLabel,
  type FeedQualityView,
} from "../../lib/feed-quality";
import { formatFullNumber } from "../../lib/format";
import type { FeedQualityRow } from "../../types/feed-quality";

interface FeedQualityFeedRowProps {
  feed: FeedQualityRow;
  view: FeedQualityView;
  isLast?: boolean;
}

export function FeedQualityFeedRow({
  feed,
  view,
  isLast = false,
}: FeedQualityFeedRowProps) {
  const config = VIEW_CONFIGS[view];
  const { relative, absolute } = formatLastAssessed(feed.last_assessed);
  const typeLabel = getFeedStreamLabel(feed);

  return (
    <tr
      className={`border-t border-oa-grey-100 bg-white hover:bg-oa-grey-50 ${
        isLast ? "border-b border-oa-grey-200" : ""
      }`}
    >
      <td className="px-3 py-2.5 text-center align-middle">
        <FeedQualityStatusButton
          status={feed.status}
          warnings={feed.warnings}
          errors={feed.errors}
        />
      </td>

      <td className="border-l-2 border-oa-cyan/25 px-3 py-2.5 align-middle">
        <div className="flex items-center gap-1.5 pl-5">
          <ExternalDataLink
            href={feed.feed_url}
            label={typeLabel}
            className="text-sm text-oa-grey-800"
          />
          <FeedVersionBadge version={feed.feed_version} />
          <FeedTypeGlossaryIcon feedType={feed.feed_type} />
        </div>
      </td>

      <FeedQualityCell value={config.getScore(feed)} />
      {config.completenessColumns.map((col) => (
        <FeedQualityCell key={col.key} value={col.get(feed)} />
      ))}

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
