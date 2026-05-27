import { ecosystemSummary } from "../data/mock-ecosystem";
import { formatNumber } from "../lib/format";

interface EcosystemStat {
  value: string;
  label: string;
  textColor: string;
}

const stats: EcosystemStat[] = [
  {
    value: formatNumber(ecosystemSummary.number_of_opportunities),
    label: "Opportunities",
    textColor: "text-oa-cyan",
  },
  {
    value: formatNumber(ecosystemSummary.number_of_publishers),
    label: "Data Publishers",
    textColor: "text-oa-orange",
  },
  {
    value: formatNumber(ecosystemSummary.number_of_activity_providers),
    label: "Activity Providers",
    textColor: "text-oa-purple",
  },
  {
    value: formatNumber(ecosystemSummary.number_of_activities),
    label: "Activities",
    textColor: "text-oa-aqua",
  },
  {
    value: `${ecosystemSummary.percentage_of_local_authorities}%`,
    label: "Of Local Authorities",
    textColor: "text-oa-magenta",
  },
];

/**
 * StatsStrip — Displays key ecosystem numbers on solid tiles for readable contrast.
 */
export function StatsStrip() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 rounded-2xl overflow-hidden bg-white/10 p-2 shadow-2xl shadow-black/20 ring-1 ring-white/20"
      aria-label="Key ecosystem statistics"
      role="group"
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative group rounded-xl bg-oa-navy px-6 py-8 text-center ring-1 ring-white/15 transition-colors duration-300 hover:bg-oa-blue/30 hover:ring-white/30 ${i === stats.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
          role="figure"
          aria-label={`${stat.value} ${stat.label}`}
        >
          <p
            className={`relative text-4xl sm:text-5xl font-extrabold ${stat.textColor}`}
          >
            {stat.value}
          </p>
          <p className="relative mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
