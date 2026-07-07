import { HeroLottie } from "./HeroLottie";
import { StatsStrip } from "./StatsStrip";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[90svh] flex items-center overflow-hidden bg-oa-navy"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-448 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 2xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <p className="text-oa-aqua font-semibold text-sm uppercase tracking-widest mb-4">
              Open data for getting active
            </p>
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              Using data to help more people{" "}
              <span className="text-oa-aqua">get active</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed">
              Across the country, thousands of sessions, classes and places to
              get active are shared as open data. The numbers below are a summary
              of it all. The same data breaks down area by area, and comes with a
              clear picture of how reliable it is.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#data"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-oa-blue text-white font-semibold text-sm hover:bg-oa-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-oa-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-transparent shadow-lg shadow-oa-cyan/25"
              >
                Explore the data
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="w-full aspect-square motion-reduce:hidden">
              <HeroLottie />
            </div>
          </div>
        </div>

        <StatsStrip />

        {/* Daily refresh note */}
        <p className="mt-4 text-center text-sm text-white/60">
          These numbers update every day, so you always see the latest.
        </p>
      </div>
    </section>
  );
}
