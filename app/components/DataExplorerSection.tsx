import { Suspense } from "react";
import { DataExplorer } from "./DataExplorer";
import { ExplorerSectionLoading } from "./ExplorerSectionLoading";
import { loadGeoHierarchy } from "../lib/geo-hierarchy.server";

async function DataExplorerLoaded() {
  const hierarchy = await loadGeoHierarchy();
  return <DataExplorer hierarchy={hierarchy} />;
}

/**
 * Layer 2 — Interactive Data Explorer (home page section).
 * Anchored at #data for in-page navigation from the hero CTA.
 */
export function DataExplorerSection() {
  return (
    <section
      id="data"
      tabIndex={-1}
      className="scroll-mt-4 bg-oa-grey-50 py-16 sm:py-20"
      aria-labelledby="explorer-heading"
    >
      <div className="mx-auto w-full max-w-448 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <header className="max-w-3xl border-l-[6px] border-oa-cyan pl-5 rounded-sm">
          <h2
            id="explorer-heading"
            className="text-3xl sm:text-4xl font-bold text-oa-navy tracking-tight"
          >
            Interactive Data Explorer
          </h2>
          <p className="mt-4 text-base text-oa-grey-700 leading-relaxed max-w-prose">
            Explore opportunity data on the map. Filters and summary float over
            the view so the geography stays in focus.
          </p>
          <a
            href="#explorer-filters"
            className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-sm focus:bg-oa-navy focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-oa-cyan"
          >
            Skip to map filters
          </a>
          <a
            href="#records"
            className="sr-only focus:fixed focus:left-44 focus:top-4 focus:z-50 focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-sm focus:bg-oa-navy focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-oa-cyan"
          >
            Skip to records
          </a>
        </header>

        <Suspense fallback={<ExplorerSectionLoading />}>
          <DataExplorerLoaded />
        </Suspense>
      </div>
    </section>
  );
}
