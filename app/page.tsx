import { ecosystemSummary } from "./data/mock-ecosystem";
import { formatNumber } from "./lib/format";
import { HeroLottie } from "./components/HeroLottie";

const stats = [
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
] as const;

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden bg-oa-navy"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text + CTAs */}
            <div className="max-w-xl">
              <p className="text-oa-aqua font-semibold text-sm uppercase tracking-widest mb-4">
                Open Data Intelligence
              </p>
              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
              >
                Using data to help more people{" "}
                <span className="text-oa-aqua">get active</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed">
                Lack of access to high-quality open data in the sport and
                physical activity sector is a barrier to getting people active.
                OpenActive helps to address this.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#data"
                  className="inline-flex items-center px-7 py-3.5 rounded-full bg-oa-cyan text-oa-navy font-semibold text-sm hover:bg-oa-aqua transition-colors focus:outline-none focus:ring-2 focus:ring-oa-cyan focus:ring-offset-2 focus:ring-offset-oa-navy shadow-lg shadow-oa-cyan/25"
                >
                  Explore the data
                </a>
                <a
                  href="https://www.openactive.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-7 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-oa-navy"
                >
                  Learn more
                  <span className="sr-only"> about OpenActive (opens in new tab)</span>
                </a>
              </div>
            </div>

            {/* Right — Lottie animation */}
            <div className="hidden md:flex items-center justify-center">
              <div className="w-full max-w-xl lg:max-w-2xl aspect-square">
                <HeroLottie />
              </div>
            </div>
          </div>

          {/* Stats strip — below the hero grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 rounded-2xl overflow-hidden bg-white/10 p-2 shadow-2xl shadow-black/20 ring-1 ring-white/20"
            aria-label="Key ecosystem statistics"
            role="group"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative group bg-oa-navy/80 backdrop-blur-md rounded-xl px-6 py-8 text-center hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/5"
                role="figure"
                aria-label={`${stat.value} ${stat.label}`}
              >
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white/10 to-transparent" />
                <p className={`relative text-4xl sm:text-5xl font-extrabold ${stat.textColor} drop-shadow-[0_0_12px_currentColor]`}>
                  {stat.value}
                </p>
                <p className="relative mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
