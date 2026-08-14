import { formatFullNumber, formatNumber } from "../../lib/format";
import {
  EXPLORER_GLOSSARY,
  SOCIO_FIELD_GLOSSARY,
} from "../../lib/explorer-glossary";
import { formatSocioRate, type SocioContextView } from "../../lib/socio-context";
import { GlossaryTip } from "../feed-quality/GlossaryTip";

type AreaContextTeaserProps = {
  socioContext: SocioContextView;
  isSocioLoading?: boolean;
  boundaryType: "lad" | "nhs";
};

function TeaserRow({
  label,
  value,
  accessibleValue,
  hint,
}: {
  label: string;
  value: string;
  accessibleValue?: string;
  hint: { label: string; definition: string; category: "metric" };
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="flex min-w-0 items-center gap-1 truncate text-sm font-medium text-oa-grey-800">
        {label}
        <GlossaryTip entry={hint} iconClassName="h-3.5 w-3.5" />
      </dt>
      <dd className="shrink-0 text-sm font-bold tabular-nums text-oa-navy">
        <span aria-hidden="true">{value}</span>
        {accessibleValue && accessibleValue !== value && (
          <span className="sr-only">{accessibleValue}</span>
        )}
      </dd>
    </div>
  );
}

/** Compact area context lines for the explorer summary panel. */
export function AreaContextTeaser({
  socioContext,
  isSocioLoading = false,
  boundaryType,
}: AreaContextTeaserProps) {
  if (boundaryType === "nhs") return null;

  const { blocks, ladRow, totalPopulation, opportunitiesPer1000 } = socioContext;
  const showTeaser =
    isSocioLoading ||
    (blocks.showPopulation && totalPopulation != null);

  if (!showTeaser) return null;

  const activeRate = ladRow?.als_active_rate;

  return (
    <section
      className="mt-4 border-t border-oa-grey-100 pt-4"
      aria-labelledby="summary-area-context"
      aria-busy={isSocioLoading || undefined}
    >
      <h3
        id="summary-area-context"
        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-oa-grey-500"
      >
        {EXPLORER_GLOSSARY.areaContext.label}
        <GlossaryTip
          entry={EXPLORER_GLOSSARY.areaContext}
          iconClassName="h-3.5 w-3.5"
        />
      </h3>

      {isSocioLoading ? (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            Loading area context
          </p>
          <div className="mt-2 space-y-2" aria-hidden="true">
            <div className="h-3.5 w-36 animate-pulse rounded bg-oa-grey-200" />
            <div className="h-3.5 w-28 animate-pulse rounded bg-oa-grey-200" />
          </div>
        </>
      ) : (
        <dl className="mt-2 divide-y divide-oa-grey-100">
          {blocks.showPopulation && totalPopulation != null && (
            <TeaserRow
              label={EXPLORER_GLOSSARY.population.label}
              value={formatNumber(totalPopulation)}
              accessibleValue={formatFullNumber(totalPopulation)}
              hint={EXPLORER_GLOSSARY.population}
            />
          )}
          {socioContext.scope === "single-lad" &&
            activeRate != null &&
            blocks.showAls && (
              <TeaserRow
                label={SOCIO_FIELD_GLOSSARY.als_active_rate.label}
                value={formatSocioRate(activeRate)}
                hint={SOCIO_FIELD_GLOSSARY.als_active_rate}
              />
            )}
          {blocks.showOpportunitiesPer1000 &&
            opportunitiesPer1000 != null && (
              <TeaserRow
                label="Per 1,000 people"
                value={opportunitiesPer1000.toLocaleString("en-GB", {
                  maximumFractionDigits: 1,
                })}
                accessibleValue={`${formatFullNumber(opportunitiesPer1000)} opportunities per 1,000 people`}
                hint={EXPLORER_GLOSSARY.opportunitiesPer1000}
              />
            )}
        </dl>
      )}
    </section>
  );
}
