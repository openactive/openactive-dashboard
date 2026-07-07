import { Suspense } from "react";
import { formatNumber } from "../lib/format";
import { getEcosystemSummary } from "../services/ecosystem";
import type { EcosystemSummaryResponse } from "../types/ecosystem";

type StatDef = {
  key: string;
  label: string;
  textColor: string;
  format: (data: EcosystemSummaryResponse) => string;
};

const STAT_DEFS: StatDef[] = [
  {
    key: "number_of_opportunities",
    label: "Opportunities",
    textColor: "text-oa-cyan",
    format: (d) => formatNumber(d.number_of_opportunities),
  },
  {
    key: "number_of_publishers",
    label: "Data Publishers",
    textColor: "text-oa-orange",
    format: (d) => formatNumber(d.number_of_publishers),
  },
  {
    key: "number_of_activity_providers",
    label: "Facility/Activity Providers",
    textColor: "text-oa-purple",
    format: (d) => formatNumber(d.number_of_activity_providers),
  },
  {
    key: "number_of_activities",
    label: "Activities",
    textColor: "text-oa-aqua",
    format: (d) => formatNumber(d.number_of_activities),
  },
  {
    key: "percentage_of_local_authorities",
    label: "Of Local Authorities",
    textColor: "text-oa-magenta",
    format: (d) => `${d.percentage_of_local_authorities}%`,
  },
];

function StatsStripSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 rounded-2xl overflow-hidden bg-white/10 p-2 shadow-2xl shadow-black/20 ring-1 ring-white/20"
      aria-label="Loading ecosystem statistics"
      role="group"
    >
      {STAT_DEFS.map((stat, i) => (
        <div
          key={stat.key}
          className={`rounded-xl bg-oa-navy px-6 py-8 text-center ring-1 ring-white/15 animate-pulse ${
            i === STAT_DEFS.length - 1 ? "col-span-2 sm:col-span-1" : ""
          }`}
        >
          <div className="mx-auto h-10 w-20 rounded bg-white/10" />
          <div className="mx-auto mt-3 h-4 w-24 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function StatsStripError() {
  return (
    <div
      className="rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/20"
      role="alert"
    >
      <p className="text-sm text-white/70">
        Unable to load ecosystem statistics. Please try again later.
      </p>
    </div>
  );
}

async function StatsStripContent() {
  let data: EcosystemSummaryResponse;
  try {
    data = await getEcosystemSummary();
  } catch {
    return <StatsStripError />;
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 rounded-2xl overflow-hidden bg-white/10 p-2 shadow-2xl shadow-black/20 ring-1 ring-white/20"
      aria-label="Key ecosystem statistics"
      role="group"
    >
      {STAT_DEFS.map((stat, i) => (
        <div
          key={stat.key}
          className={`relative group rounded-xl bg-oa-navy px-6 py-8 text-center ring-1 ring-white/15 transition-colors duration-300 hover:bg-oa-blue/30 hover:ring-white/30 ${
            i === STAT_DEFS.length - 1 ? "col-span-2 sm:col-span-1" : ""
          }`}
          role="figure"
          aria-label={`${stat.format(data)} ${stat.label}`}
        >
          <p
            className={`relative text-4xl sm:text-5xl font-extrabold ${stat.textColor}`}
          >
            {stat.format(data)}
          </p>
          <p className="relative mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatsStrip() {
  return (
    <Suspense fallback={<StatsStripSkeleton />}>
      <StatsStripContent />
    </Suspense>
  );
}
