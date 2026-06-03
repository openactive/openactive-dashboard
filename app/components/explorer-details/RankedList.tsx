import { formatFullNumber, formatNumber } from "../../lib/format";
import type { RankedItem } from "../../lib/explore-filters";

interface RankedListProps {
  items: RankedItem[] | undefined;
  barColor: string;
  unitLabel: string;
}

/** Bar list body for a `top*` collection. */
export function RankedList({ items, barColor, unitLabel }: RankedListProps) {
  const list = items ?? [];

  if (list.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-oa-grey-500">
        No data in this selection.
      </p>
    );
  }

  const max = Math.max(...list.map((a) => a.count), 1);

  return (
    <ul className="space-y-3">
      {list.map((a) => (
        <li key={a.name}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-oa-grey-800" title={a.name}>
              {a.name}
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-oa-navy">
              <span aria-hidden="true">{formatNumber(a.count)}</span>
              <span className="sr-only">
                {formatFullNumber(a.count)} {unitLabel}
              </span>
            </span>
          </div>
          <div
            className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-oa-grey-100"
            role="presentation"
            aria-hidden="true"
          >
            <div
              className={`h-full rounded-sm ${barColor} transition-all duration-300`}
              style={{ width: `${Math.max(4, (a.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
