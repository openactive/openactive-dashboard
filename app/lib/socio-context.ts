import type { SocioAreaRow } from "../types/socio";

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

export function hasImdData(row: SocioAreaRow): boolean {
  return (
    row.imd25_average_score != null ||
    row.imd25_rank_of_average_score != null ||
    row.imd25_pct_lsoas_in_most_deprived_10pct != null ||
    row.imd25_extent != null ||
    row.imd25_local_concentration != null
  );
}

export function hasAlsData(row: SocioAreaRow): boolean {
  return (
    row.als_respondents != null ||
    row.als_active_pop != null ||
    row.als_fairly_active_pop != null ||
    row.als_inactive_pop != null ||
    row.als_survey_adult_population != null ||
    row.als_active_rate != null ||
    row.als_fairly_active_rate != null ||
    row.als_inactive_rate != null ||
    row.als_active_rate_change_12m != null ||
    row.als_inactive_rate_change_12m != null
  );
}

/** England local authority rows carry IMD and/or Active Lives data. */
export function isEnglandLadRow(row: SocioAreaRow): boolean {
  return hasImdData(row) || hasAlsData(row);
}

export function sumPopulation(rows: SocioAreaRow[]): number | null {
  if (rows.length === 0) return null;

  let total = 0;
  for (const row of rows) {
    if (row.total_population == null) continue;
    total += row.total_population;
  }

  return total > 0 ? total : null;
}

export type SocioContextScope = "single-lad" | "multi-or-aggregate" | "empty";

export type SocioContextBlocks = {
  showPopulation: boolean;
  showOpportunitiesPer1000: boolean;
  showImd: boolean;
  showAls: boolean;
  showEnglandOnlyNote: boolean;
};

export type SocioContextView = {
  scope: SocioContextScope;
  blocks: SocioContextBlocks;
  /** Single LAD row when scope is single-lad; otherwise null */
  ladRow: SocioAreaRow | null;
  totalPopulation: number | null;
  opportunitiesPer1000: number | null;
};

const EMPTY_BLOCKS: SocioContextBlocks = {
  showPopulation: false,
  showOpportunitiesPer1000: false,
  showImd: false,
  showAls: false,
  showEnglandOnlyNote: false,
};

export function resolveSocioContext(
  rows: SocioAreaRow[],
  totalOpportunities: number,
): SocioContextView {
  if (rows.length === 0) {
    return {
      scope: "empty",
      blocks: EMPTY_BLOCKS,
      ladRow: null,
      totalPopulation: null,
      opportunitiesPer1000: null,
    };
  }

  const singleEnglandLad =
    rows.length === 1 && rows[0] != null && isEnglandLadRow(rows[0]);

  if (singleEnglandLad) {
    const row = rows[0]!;
    const population = row.total_population;

    return {
      scope: "single-lad",
      blocks: {
        showPopulation: population != null,
        showOpportunitiesPer1000: population != null && population > 0,
        showImd: hasImdData(row),
        showAls: hasAlsData(row),
        showEnglandOnlyNote: false,
      },
      ladRow: row,
      totalPopulation: population,
      opportunitiesPer1000: opportunitiesPer1000(
        totalOpportunities,
        population,
      ),
    };
  }

  const population = sumPopulation(rows);
  const showEnglandOnlyNote = rows.some((row) => !isEnglandLadRow(row));

  return {
    scope: "multi-or-aggregate",
    blocks: {
      showPopulation: population != null,
      showOpportunitiesPer1000: population != null && population > 0,
      showImd: false,
      showAls: false,
      showEnglandOnlyNote,
    },
    ladRow: null,
    totalPopulation: population,
    opportunitiesPer1000: opportunitiesPer1000(totalOpportunities, population),
  };
}
