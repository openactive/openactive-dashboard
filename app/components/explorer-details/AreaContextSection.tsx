import type { GlossaryEntry } from "../../lib/feed-quality-glossary";
import { formatFullNumber, formatNumber } from "../../lib/format";
import {
  EXPLORER_GLOSSARY,
  SOCIO_FIELD_GLOSSARY,
} from "../../lib/explorer-glossary";
import {
  formatSocioProportion,
  formatSocioRate,
  formatSocioRateChange,
  type SocioContextView,
} from "../../lib/socio-context";
import type { SocioAreaRow } from "../../types/socio";
import { GlossaryTip } from "../feed-quality/GlossaryTip";

type SocioMetricRowProps = {
  label: string;
  displayValue: string;
  accessibleValue?: string;
  hint?: GlossaryEntry;
  unitHint?: GlossaryEntry;
};

function SocioMetricRow({
  label,
  displayValue,
  accessibleValue,
  hint,
  unitHint,
}: SocioMetricRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-3">
      <dt className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-medium text-oa-grey-800">
          <span className="truncate">{label}</span>
          {hint && (
            <span className="shrink-0">
              <GlossaryTip entry={hint} iconClassName="h-3.5 w-3.5" />
            </span>
          )}
        </span>
      </dt>
      <dd className="flex shrink-0 items-center gap-1 text-base font-bold tabular-nums text-oa-navy">
        <span aria-hidden="true">{displayValue}</span>
        {accessibleValue && accessibleValue !== displayValue && (
          <span className="sr-only">{accessibleValue}</span>
        )}
        {unitHint && (
          <span className="shrink-0 font-normal">
            <GlossaryTip entry={unitHint} iconClassName="h-3.5 w-3.5" />
          </span>
        )}
      </dd>
    </div>
  );
}

function SubsectionHeading({
  id,
  label,
  hint,
}: {
  id: string;
  label: string;
  hint: GlossaryEntry;
}) {
  return (
    <h4
      id={id}
      className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500"
    >
      {label}
      <GlossaryTip entry={hint} iconClassName="h-3.5 w-3.5" />
    </h4>
  );
}

function formatCount(value: number): { display: string; accessible: string } {
  return {
    display: formatNumber(value),
    accessible: formatFullNumber(value),
  };
}

function formatDecimal(value: number, fractionDigits: number): string {
  return value.toLocaleString("en-GB", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });
}

function formatPer1000(value: number): string {
  return value.toLocaleString("en-GB", { maximumFractionDigits: 1 });
}

function renderImdRows(row: SocioAreaRow) {
  const rows: SocioMetricRowProps[] = [];

  if (row.imd25_average_score != null) {
    rows.push({
      label: SOCIO_FIELD_GLOSSARY.imd25_average_score.label,
      displayValue: formatDecimal(row.imd25_average_score, 2),
      hint: SOCIO_FIELD_GLOSSARY.imd25_average_score,
    });
  }
  if (row.imd25_rank_of_average_score != null) {
    rows.push({
      label: SOCIO_FIELD_GLOSSARY.imd25_rank_of_average_score.label,
      displayValue: formatFullNumber(row.imd25_rank_of_average_score),
      hint: SOCIO_FIELD_GLOSSARY.imd25_rank_of_average_score,
    });
  }
  if (row.imd25_pct_lsoas_in_most_deprived_10pct != null) {
    rows.push({
      label: SOCIO_FIELD_GLOSSARY.imd25_pct_lsoas_in_most_deprived_10pct.label,
      displayValue: formatSocioProportion(
        row.imd25_pct_lsoas_in_most_deprived_10pct,
      ),
      hint: SOCIO_FIELD_GLOSSARY.imd25_pct_lsoas_in_most_deprived_10pct,
    });
  }
  if (row.imd25_extent != null) {
    rows.push({
      label: SOCIO_FIELD_GLOSSARY.imd25_extent.label,
      displayValue: formatSocioProportion(row.imd25_extent),
      hint: SOCIO_FIELD_GLOSSARY.imd25_extent,
    });
  }
  if (row.imd25_local_concentration != null) {
    const formatted = formatCount(row.imd25_local_concentration);
    rows.push({
      label: SOCIO_FIELD_GLOSSARY.imd25_local_concentration.label,
      displayValue: formatted.display,
      accessibleValue: formatted.accessible,
      hint: SOCIO_FIELD_GLOSSARY.imd25_local_concentration,
    });
  }

  return rows;
}

function renderAlsRows(row: SocioAreaRow) {
  const rows: SocioMetricRowProps[] = [];

  const countFields = [
    ["als_respondents", row.als_respondents],
    ["als_survey_adult_population", row.als_survey_adult_population],
    ["als_active_pop", row.als_active_pop],
    ["als_fairly_active_pop", row.als_fairly_active_pop],
    ["als_inactive_pop", row.als_inactive_pop],
  ] as const;

  for (const [key, value] of countFields) {
    if (value == null) continue;
    const formatted = formatCount(value);
    const hint = SOCIO_FIELD_GLOSSARY[key];
    rows.push({
      label: hint.label,
      displayValue: formatted.display,
      accessibleValue: formatted.accessible,
      hint,
    });
  }

  const rateFields = [
    ["als_active_rate", row.als_active_rate],
    ["als_fairly_active_rate", row.als_fairly_active_rate],
    ["als_inactive_rate", row.als_inactive_rate],
  ] as const;

  for (const [key, value] of rateFields) {
    if (value == null) continue;
    const hint = SOCIO_FIELD_GLOSSARY[key];
    rows.push({
      label: hint.label,
      displayValue: formatSocioRate(value),
      hint,
    });
  }

  const changeFields = [
    ["als_active_rate_change_12m", row.als_active_rate_change_12m],
    ["als_inactive_rate_change_12m", row.als_inactive_rate_change_12m],
  ] as const;

  for (const [key, value] of changeFields) {
    if (value == null) continue;
    const hint = SOCIO_FIELD_GLOSSARY[key];
    rows.push({
      label: hint.label,
      displayValue: formatSocioRateChange(value),
      accessibleValue: formatSocioRateChange(value).replace(
        " pp",
        " percentage points",
      ),
      hint,
      unitHint: EXPLORER_GLOSSARY.percentagePoints,
    });
  }

  return rows;
}

function MetricGroup({
  headingId,
  label,
  hint,
  rows,
}: {
  headingId: string;
  label: string;
  hint: GlossaryEntry;
  rows: SocioMetricRowProps[];
}) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-5 first:mt-0">
      <SubsectionHeading id={headingId} label={label} hint={hint} />
      <dl className="divide-y divide-oa-grey-100">
        {rows.map((row) => (
          <SocioMetricRow key={row.label} {...row} />
        ))}
      </dl>
    </section>
  );
}

type AreaContextSectionProps = {
  socioContext: SocioContextView;
  isSocioLoading?: boolean;
  boundaryType: "lad" | "nhs";
};

export function AreaContextSection({
  socioContext,
  isSocioLoading = false,
  boundaryType,
}: AreaContextSectionProps) {
  const { blocks, ladRow, totalPopulation, opportunitiesPer1000 } = socioContext;
  const showSection =
    isSocioLoading ||
    socioContext.scope !== "empty" ||
    boundaryType === "nhs";

  if (!showSection) return null;

  const populationFormatted =
    totalPopulation != null ? formatCount(totalPopulation) : null;

  const populationRows: SocioMetricRowProps[] = [];
  if (blocks.showPopulation && populationFormatted) {
    populationRows.push({
      label: SOCIO_FIELD_GLOSSARY.total_population.label,
      displayValue: populationFormatted.display,
      accessibleValue: populationFormatted.accessible,
      hint: SOCIO_FIELD_GLOSSARY.total_population,
    });
  }
  if (blocks.showOpportunitiesPer1000 && opportunitiesPer1000 != null) {
    populationRows.push({
      label: SOCIO_FIELD_GLOSSARY.opportunities_per_1000.label,
      displayValue: formatPer1000(opportunitiesPer1000),
      accessibleValue: `${formatFullNumber(opportunitiesPer1000)} opportunities per 1,000 people`,
      hint: SOCIO_FIELD_GLOSSARY.opportunities_per_1000,
    });
  }

  return (
    <section
      className="border-t border-oa-grey-100 px-6 py-6"
      aria-labelledby="details-area-context"
      aria-busy={isSocioLoading || undefined}
    >
      <h3
        id="details-area-context"
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500"
      >
        {EXPLORER_GLOSSARY.areaContext.label}
        <GlossaryTip
          entry={EXPLORER_GLOSSARY.areaContext}
          iconClassName="h-3.5 w-3.5"
        />
      </h3>

      {isSocioLoading && (
        <p className="sr-only" role="status" aria-live="polite">
          Loading area context
        </p>
      )}

      {isSocioLoading ? (
        <div className="mt-4 space-y-3" aria-hidden="true">
          <div className="h-4 w-48 animate-pulse rounded bg-oa-grey-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-oa-grey-200" />
          <div className="h-4 w-44 animate-pulse rounded bg-oa-grey-200" />
        </div>
      ) : boundaryType === "nhs" ? (
        <p className="mt-3 text-sm leading-relaxed text-oa-grey-700">
          Area context is available for local authorities. Switch to local
          authority boundaries to see population, deprivation, and activity
          levels.
        </p>
      ) : socioContext.scope === "empty" ? (
        <p className="mt-3 text-sm leading-relaxed text-oa-grey-700">
          No area context data is available for this selection.
        </p>
      ) : (
        <>
          <MetricGroup
            headingId="details-area-population"
            label="Population"
            hint={EXPLORER_GLOSSARY.population}
            rows={populationRows}
          />

          {blocks.showEnglandOnlyNote && (
            <p className="mt-5 text-sm leading-relaxed text-oa-grey-700">
              <span className="inline-flex items-center gap-1 font-medium text-oa-grey-800">
                {EXPLORER_GLOSSARY.areaContextEnglandOnly.label}
                <GlossaryTip
                  entry={EXPLORER_GLOSSARY.areaContextEnglandOnly}
                  iconClassName="h-3.5 w-3.5"
                />
              </span>
              {" — "}
              {EXPLORER_GLOSSARY.areaContextEnglandOnly.definition}
            </p>
          )}

          {blocks.showImd && ladRow && (
            <MetricGroup
              headingId="details-area-imd"
              label={EXPLORER_GLOSSARY.imdDeprivation.label}
              hint={EXPLORER_GLOSSARY.imdDeprivation}
              rows={renderImdRows(ladRow)}
            />
          )}

          {blocks.showAls && ladRow && (
            <MetricGroup
              headingId="details-area-als"
              label={EXPLORER_GLOSSARY.activeLives.label}
              hint={EXPLORER_GLOSSARY.activeLives}
              rows={renderAlsRows(ladRow)}
            />
          )}
        </>
      )}
    </section>
  );
}
