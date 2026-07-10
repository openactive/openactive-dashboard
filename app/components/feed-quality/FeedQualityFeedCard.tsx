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
  getFeedStreamLabel,
  type FeedQualityView,
} from "../../lib/feed-quality";
import { formatFullNumber } from "../../lib/format";
import type { FeedQualityRow } from "../../types/feed-quality";

interface FeedQualityFeedCardProps {
  feed: FeedQualityRow;
  view: FeedQualityView;
}

const MOBILE_STAT_LABELS: Record<string, string> = {
  activity: "Activity",
  accessibility: "Access",
  gender: "Gender",
};

export function FeedQualityFeedCard({ feed, view }: FeedQualityFeedCardProps) {
  const config = VIEW_CONFIGS[view];
  const { relative, absolute } = formatLastAssessed(feed.last_assessed);
  const typeLabel = getFeedStreamLabel(feed);

  return (
    <article className="space-y-3 border-l-2 border-oa-cyan/25 py-3 pl-4 pr-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <FeedQualityStatusButton
          status={feed.status}
          warnings={feed.warnings}
          errors={feed.errors}
        />
        <ExternalDataLink
          href={feed.feed_url}
          label={typeLabel}
          className="min-w-0 text-sm font-medium text-oa-grey-800"
        />
        <FeedVersionBadge version={feed.feed_version} />
        <FeedTypeGlossaryIcon feedType={feed.feed_type} />
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <Stat label="Completeness" colKey="quality" value={config.getScore(feed)} />
        {config.completenessColumns.map((col) => (
          <Stat
            key={col.key}
            label={MOBILE_STAT_LABELS[col.key] ?? col.label}
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
        <time dateTime={feed.last_assessed} title={absolute} className="shrink-0">
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
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-oa-grey-500">
        <span className="truncate">{label}</span>
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
