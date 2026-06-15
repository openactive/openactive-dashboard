import { COMPLETENESS_BANDS, getCompletenessBand } from "../../lib/feed-quality";

interface FeedQualityCellProps {
  value: number | null;
}

export function FeedQualityCell({ value }: FeedQualityCellProps) {
  const band = getCompletenessBand(value);
  const { cellClass, label } = COMPLETENESS_BANDS[band];

  if (value === null) {
    return (
      <td className={`px-3 py-2.5 text-center text-sm font-semibold tabular-nums ${cellClass}`}>
        <span aria-hidden="true">—</span>
        <span className="sr-only">{label}</span>
      </td>
    );
  }

  const rounded = Math.round(value);
  return (
    <td className={`px-3 py-2.5 text-center text-sm font-semibold tabular-nums ${cellClass}`}>
      {rounded}%
      <span className="sr-only"> ({label})</span>
    </td>
  );
}
