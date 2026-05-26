import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/16/solid";

export type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  /** The label describing the stat */
  label: string;
  /** The primary numeric or text value */
  value: string | number;
  /** Optional formatted change string, e.g. "+12%" */
  change?: string;
  /** Direction of the trend — determines colour and icon */
  trend?: TrendDirection;
  /** Whether a positive trend is good (green) or bad (red). Default: true */
  positiveIsGood?: boolean;
  /** Optional unit or suffix shown after the value */
  unit?: string;
}

/**
 * StatCard — a key metric tile used across all dashboard layers.
 * Displays a label, prominent value, and an optional trend indicator.
 * Fully responsive and WCAG-accessible with proper ARIA markup.
 */
export function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  positiveIsGood = true,
  unit,
}: StatCardProps) {
  const trendColor = getTrendColor(trend, positiveIsGood);
  const TrendIcon = trend === "up" ? ArrowUpIcon : trend === "down" ? ArrowDownIcon : null;

  return (
    <article
      className="rounded-lg border border-oa-grey-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      aria-label={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
    >
      <p className="text-sm font-medium text-oa-grey-500 leading-tight">{label}</p>

      <p className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-oa-grey-900 tabular-nums">{value}</span>
        {unit && <span className="text-sm text-oa-grey-500">{unit}</span>}
      </p>

      {change && (
        <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          {TrendIcon && (
            <TrendIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          )}
          <span>
            {change}
            <span className="sr-only">
              {trend === "up" ? " increase" : trend === "down" ? " decrease" : ""}
            </span>
          </span>
        </p>
      )}
    </article>
  );
}

function getTrendColor(trend: TrendDirection, positiveIsGood: boolean): string {
  if (trend === "neutral") return "text-oa-grey-500";
  const isGood = (trend === "up" && positiveIsGood) || (trend === "down" && !positiveIsGood);
  return isGood ? "text-emerald-600" : "text-red-600";
}
