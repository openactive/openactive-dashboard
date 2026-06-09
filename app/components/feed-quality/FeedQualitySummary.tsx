import { formatFullNumber } from "../../lib/format";

interface FeedQualitySummaryProps {
  total: number;
  okCount: number;
  warningCount: number;
  errorCount: number;
}

interface Segment {
  key: "ok" | "warning" | "error";
  count: number;
  label: string;
  description: string;
  bar: string;
  dot: string;
}

export function FeedQualitySummary({
  total,
  okCount,
  warningCount,
  errorCount,
}: FeedQualitySummaryProps) {
  const segments: Segment[] = [
    {
      key: "ok",
      count: okCount,
      label: "Healthy",
      description: "Publishing well, no issues found.",
      bar: "bg-oa-cyan",
      dot: "bg-oa-cyan",
    },
    {
      key: "warning",
      count: warningCount,
      label: "Warnings",
      description: "Publishing, but some quality checks didn't pass.",
      bar: "bg-oa-yellow",
      dot: "bg-oa-yellow",
    },
    {
      key: "error",
      count: errorCount,
      label: "Errors",
      description: "Couldn't be assessed or has serious issues.",
      bar: "bg-oa-scarlet",
      dot: "bg-oa-scarlet",
    },
  ];

  return (
    <article
      aria-label="Feed status overview"
      className="rounded-sm bg-white p-6 shadow-sm ring-1 ring-oa-grey-200 sm:p-7"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-oa-grey-600">
        Feed status
      </p>

      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-5xl font-bold tabular-nums tracking-tight text-oa-navy">
          {formatFullNumber(total)}
        </span>
        <span className="text-sm font-medium text-oa-grey-600">
          {total === 1 ? "feed tracked" : "feeds tracked"}
        </span>
      </p>

      <ProportionBar segments={segments} total={total} />

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        {segments.map((segment) => (
          <LegendItem key={segment.key} segment={segment} total={total} />
        ))}
      </dl>
    </article>
  );
}

function ProportionBar({ segments, total }: { segments: Segment[]; total: number }) {
  if (total === 0) {
    return (
      <div
        aria-hidden="true"
        className="mt-5 h-2.5 w-full rounded-full bg-oa-grey-100"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-oa-grey-100"
    >
      {segments.map((segment) =>
        segment.count === 0 ? null : (
          <div
            key={segment.key}
            className={segment.bar}
            style={{ width: `${(segment.count / total) * 100}%` }}
          />
        )
      )}
    </div>
  );
}

function LegendItem({ segment, total }: { segment: Segment; total: number }) {
  const percent = total === 0 ? null : Math.round((segment.count / total) * 100);
  return (
    <div>
      <dt className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 translate-y-[-1px] rounded-full ${segment.dot}`}
        />
        <span className="text-sm font-semibold text-oa-navy">{segment.label}</span>
      </dt>
      <dd className="mt-1.5">
        <p className="text-sm tabular-nums">
          <span className="font-bold text-oa-navy">{formatFullNumber(segment.count)}</span>
          {percent !== null && (
            <span className="ml-1 text-oa-grey-500">({percent}%)</span>
          )}
        </p>
        <p className="mt-1 text-xs text-oa-grey-600 leading-relaxed">
          {segment.description}
        </p>
      </dd>
    </div>
  );
}
