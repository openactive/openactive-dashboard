import { ExternalDataLink } from "./ExternalDataLink";
import { FeedQualityStatusButton } from "./FeedQualityStatusButton";
import { FeedVersionBadge } from "./FeedVersionBadge";
import {
  ColumnGlossaryIcon,
  FeedTypeGlossaryIcon,
} from "./feed-quality-glossary-ui";
import {
  COMPLETENESS_BANDS,
  VIEW_CONFIGS,
  formatLastAssessed,
  getCompletenessBand,
  humaniseFeedType,
  type FeedQualityView,
} from "../../lib/feed-quality";
import { formatFullNumber } from "../../lib/format";
import type { FeedQualityRow } from "../../types/feed-quality";

interface FeedQualityFeedCardProps {
  feed: FeedQualityRow;
  view: FeedQualityView;
}

export function FeedQualityFeedCard({ feed, view }: FeedQualityFeedCardProps) {
  const config = VIEW_CONFIGS[view];
  const { relative, absolute } = formatLastAssessed(feed.last_assessed);
  const typeLabel = humaniseFeedType(feed.feed_type);

  return (
    <article className="space-y-3 border-l-2 border-oa-grey-200 px-4 py-3.5 pl-5">
      <div className="flex items-center gap-2">
        <FeedQualityStatusButton
          status={feed.status}
          warnings={feed.warnings}
          errors={feed.errors}
        />
        <ExternalDataLink
          href={feed.feed_url}
          label={typeLabel}
          className="text-sm font-medium text-oa-grey-800"
        />
        <FeedVersionBadge version={feed.feed_version} />
        <FeedTypeGlossaryIcon feedType={feed.feed_type} />
      </div>

      <dl className="grid grid-cols-3 gap-1.5">
        <Stat label="Completeness" colKey="quality" value={config.getScore(feed)} />
        {config.completenessColumns.map((col) => (
          <Stat
            key={col.key}
            label={col.label}
            colKey={col.key}
            value={col.get(feed)}
          />
        ))}
      </dl>

      <p className="flex items-center justify-between gap-2 text-xs text-oa-grey-600">
        <span>
          <span className="font-semibold tabular-nums text-oa-navy">
            {formatFullNumber(feed.num_future_opportunity_items)}
          </span>{" "}
          opportunities
        </span>
        <time dateTime={feed.last_assessed} title={absolute}>
          {relative}
        </time>
      </p>
    </article>
  );
}

function Stat({
  label,
  colKey,
  value,
}: {
  label: string;
  colKey: string;
  value: number | null;
}) {
  const band = getCompletenessBand(value);
  const { cellClass, label: bandLabel } = COMPLETENESS_BANDS[band];
  return (
    <div className="flex flex-col items-stretch gap-1 text-center">
      <dt className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-oa-grey-500">
        {label}
        <ColumnGlossaryIcon colKey={colKey} />
      </dt>
      <dd
        className={`flex h-8 items-center justify-center rounded-sm text-sm font-semibold tabular-nums ${cellClass}`}
      >
        {value === null ? (
          <span aria-hidden="true">—</span>
        ) : (
          <span aria-hidden="true">{Math.round(value)}%</span>
        )}
        <span className="sr-only">{bandLabel}</span>
      </dd>
    </div>
  );
}
