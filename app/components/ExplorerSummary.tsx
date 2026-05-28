import { formatFullNumber, formatNumber } from "../lib/format";
import {
  EXPLORER_SUMMARY_METRIC_DEFS,
  EXPLORER_SUMMARY_METRIC_KEYS,
  type ExplorerSummary as ExplorerSummaryData,
} from "../lib/explore-filters";

type SummaryLayout = "overlay" | "sheet";

interface ExplorerSummaryProps {
  summary: ExplorerSummaryData;
  selectionLabel: string;
  layout?: SummaryLayout;
}

type Metric = {
  label: string;
  value: number;
  color: string;
};

function MetricBreakdown({
  metrics,
  metricMax,
  trackClassName,
}: {
  metrics: Metric[];
  metricMax: number;
  trackClassName: string;
}) {
  return (
    <ul className="space-y-4">
      {metrics.map((m) => (
        <li key={m.label}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-oa-grey-800">{m.label}</span>
            <span className="text-lg font-bold tabular-nums text-oa-navy">
              <span aria-hidden="true">{formatNumber(m.value)}</span>
              <span className="sr-only">{formatFullNumber(m.value)}</span>
            </span>
          </div>
          <div
            className={`mt-2 h-1.5 w-full overflow-hidden rounded-sm ${trackClassName}`}
            role="presentation"
            aria-hidden="true"
          >
            <div
              className={`h-full rounded-sm ${m.color} transition-all duration-300`}
              style={{ width: `${Math.max(8, (m.value / metricMax) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SummaryHeadline({
  selectionLabel,
  total,
  headlineLabel,
}: {
  selectionLabel: string;
  total: number;
  headlineLabel: string;
}) {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-600">
        {selectionLabel}
      </p>
      <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-oa-navy">
        <span aria-hidden="true">{formatNumber(total)}</span>
        <span className="sr-only">{headlineLabel}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-oa-grey-700">Future opportunities</p>
    </>
  );
}

/**
 * Summary stats for the data explorer — glass overlay on desktop, flat sheet on mobile.
 */
export function ExplorerSummary({
  summary,
  selectionLabel,
  layout = "overlay",
}: ExplorerSummaryProps) {
  const headlineLabel = `${formatFullNumber(summary.totalOpportunities)} future opportunities`;

  const metrics: Metric[] = EXPLORER_SUMMARY_METRIC_KEYS.map((key) => ({
    label: EXPLORER_SUMMARY_METRIC_DEFS[key].desktopLabel,
    value: summary[key],
    color: EXPLORER_SUMMARY_METRIC_DEFS[key].color,
  }));
  const metricMax = Math.max(...metrics.map((m) => m.value), 1);

  if (layout === "sheet") {
    return (
      <div aria-live="polite" aria-atomic="true">
        <SummaryHeadline
          selectionLabel={selectionLabel}
          total={summary.totalOpportunities}
          headlineLabel={headlineLabel}
        />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-600 mb-4">
          In this selection
        </p>
        <MetricBreakdown
          metrics={metrics}
          metricMax={metricMax}
          trackClassName="bg-oa-grey-200"
        />
      </div>
    );
  }

  return (
    <div
      className="oa-glass oa-glass-strong rounded-xl ring-1 ring-white/70 overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="p-5 border-b border-white/50">
        <SummaryHeadline
          selectionLabel={selectionLabel}
          total={summary.totalOpportunities}
          headlineLabel={headlineLabel}
        />
      </div>

      <div className="p-5 bg-white/25">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-600 mb-4">
          In this selection
        </p>
        <MetricBreakdown
          metrics={metrics}
          metricMax={metricMax}
          trackClassName="bg-white/50"
        />
      </div>
    </div>
  );
}
