/** e.g. 0.578 - "57.8%" */
export function formatSocioRate(rate: number): string {
  return `${(rate * 100).toLocaleString("en-GB", {
    maximumFractionDigits: 1,
  })}%`;
}

/** e.g. 0.4211 → "+42.1%" */
export function formatSocioProportion(proportion: number): string {
  return formatSocioRate(proportion);
}

/** e.g. 0.0116 → "+1.2 pp" (percentage points) */
export function formatSocioRateChange(change: number): string {
  const points = change * 100;
  const formatted = Math.abs(points).toLocaleString("en-GB", {
    maximumFractionDigits: 1,
  });

  const sign = points > 0 ? "+" : points < 0 ? "-" : "";
  return `${sign}${formatted} pp`;
}

/** Opportunities per 1,000 people; null if population is missing(null) or zero */
export function opportunitiesPer1000(
  opportunities: number,
  population: number | null,
): number | null {
  if (population == null || population <= 0) return null;
  return (opportunities / population) * 1000;
}
