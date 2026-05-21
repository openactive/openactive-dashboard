import { formatFullNumber, formatNumber } from "../lib/format";
import type { ExplorerSummary as ExplorerSummaryData } from "../lib/explore-filters";

interface ExplorerSummaryProps {
  summary: ExplorerSummaryData;
  selectionLabel: string;
  layout?: "stacked" | "overlay";
}

/**
 * Summary stats — stacked glass cards when floating over the map.
 */
export function ExplorerSummary({
  summary,
  selectionLabel,
  layout = "stacked",
}: ExplorerSummaryProps) {
  const headlineLabel = `${formatFullNumber(summary.totalOpportunities)} future opportunities`;
  const isOverlay = layout === "overlay";

  const metrics = [
    { label: "Local areas", value: summary.areaCount, color: "bg-oa-cyan" },
    { label: "Publishers", value: summary.publisherCount, color: "bg-oa-blue" },
    {
      label: "Activities",
      value: summary.activityCount,
      color: "bg-oa-indigo",
    },
  ];
  const metricMax = Math.max(...metrics.map((m) => m.value), 1);

  if (isOverlay) {
    return (
      <div
        className="oa-glass oa-glass-strong rounded-xl ring-1 ring-white/70 overflow-hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="p-5 border-b border-white/50">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-600">
            {selectionLabel}
          </p>
          <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight text-oa-navy drop-shadow-sm">
            <span aria-hidden="true">{formatNumber(summary.totalOpportunities)}</span>
            <span className="sr-only">{headlineLabel}</span>
          </p>
          <p className="mt-1 text-sm font-medium text-oa-grey-700">
            Future opportunities
          </p>
        </div>

        <div className="p-5 bg-white/25">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-oa-grey-600 mb-4">
            In this selection
          </p>
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
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-sm bg-white/50"
                  role="presentation"
                >
                  <div
                    className={`h-full rounded-sm ${m.color} transition-all duration-300`}
                    style={{ width: `${Math.max(8, (m.value / metricMax) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative border border-oa-grey-300 bg-white overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="border-l-[6px] border-oa-cyan bg-oa-navy px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-oa-aqua">
          Filtered results
        </p>
        <p
          className="mt-1 text-sm text-white/75 truncate font-medium"
          title={selectionLabel}
        >
          {selectionLabel}
        </p>
      </div>
      <div className="px-5 py-6 sm:px-6 sm:py-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-oa-grey-500">
          Future opportunities
        </p>
        <p className="mt-2 font-mono text-5xl sm:text-[3.25rem] font-bold leading-none tabular-nums text-oa-navy">
          <span aria-hidden="true">{formatNumber(summary.totalOpportunities)}</span>
          <span className="sr-only">{headlineLabel}</span>
        </p>
        <dl className="mt-8 divide-y divide-oa-grey-200 border-t border-oa-grey-200">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-3"
            >
              <dt className="text-sm text-oa-grey-600">{m.label}</dt>
              <dd className="font-mono text-xl font-bold tabular-nums text-oa-cyan">
                {formatNumber(m.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
