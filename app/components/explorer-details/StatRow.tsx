import { formatFullNumber, formatNumber } from "../../lib/format";

interface StatRowProps {
  label: string;
  value: number;
  sub?: string;
}

/** The sr-only span carries the un-abbreviated number for screen readers. */
export function StatRow({ label, value, sub }: StatRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-oa-grey-800">
          {label}
        </p>
        {sub && <p className="mt-0.5 text-xs text-oa-grey-600">{sub}</p>}
      </div>
      <p className="shrink-0 text-base font-bold tabular-nums text-oa-navy">
        <span aria-hidden="true">{formatNumber(value)}</span>
        <span className="sr-only">{formatFullNumber(value)}</span>
      </p>
    </div>
  );
}
