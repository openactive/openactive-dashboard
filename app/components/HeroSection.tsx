import { HeroLottie } from "./HeroLottie";
import { StatsStrip } from "./StatsStrip";

/**
 * Layer 1 — Hero and ecosystem summary stats (home page section).
 */
export function HeroSection() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-oa-navy"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-448 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16 2xl:px-12">
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
              Lack of access to high-quality open data in the sport and physical
              activity sector is a barrier to getting people active. OpenActive
              helps to address this.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#data"
                className="inline-flex items-center px-7 py-3.5 rounded-full bg-oa-cyan text-white font-semibold text-sm hover:bg-oa-blue transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-oa-navy shadow-lg shadow-oa-cyan/25"
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
                <span className="sr-only">
                  {" "}
                  about OpenActive (opens in new tab)
                </span>
              </a>
            </div>
          </div>

          {/* Right — Lottie animation */}
          <div className="flex items-center justify-center">
            <div className="w-full aspect-square">
              <HeroLottie />
            </div>
          </div>
        </div>

        <StatsStrip />
      </div>
    </section>
  );
}
