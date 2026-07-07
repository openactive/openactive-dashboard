import { formatFullNumber, formatNumber } from "../../lib/format";
import { GlossaryTip } from "../feed-quality/GlossaryTip";
import type { GlossaryEntry } from "../../lib/feed-quality-glossary";

interface StatRowProps {
  label: string;
  value: number;
  sub?: string;
  hint?: GlossaryEntry;
}

/** The sr-only span carries the un-abbreviated number for screen readers. */
export function StatRow({ label, value, sub, hint }: StatRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-sm font-medium text-oa-grey-800">
          <span className="truncate">{label}</span>
          {hint && (
            <span className="shrink-0">
              <GlossaryTip entry={hint} iconClassName="h-3.5 w-3.5" />
            </span>
          )}
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
