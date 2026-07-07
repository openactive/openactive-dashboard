import { Suspense } from "react";
import { DataExplorer } from "./DataExplorer";
import { ExplorerSectionLoading } from "./ExplorerSectionLoading";
import { loadGeoHierarchy } from "../lib/geo-hierarchy.server";

async function DataExplorerLoaded() {
  const hierarchy = await loadGeoHierarchy();
  return <DataExplorer hierarchy={hierarchy} />;
}

export function DataExplorerSection() {
  return (
    <section
      id="data"
      tabIndex={-1}
      className="scroll-mt-4 bg-oa-grey-50 py-5 sm:py-8"
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
            See what is on offer to get active in any part of the country. Choose an area
            on the map to reveal the opportunities available there, from led sessions and
            classes to facilities like courts and pitches.
          </p>
          <a
            href="#explorer-filters"
            className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-sm focus:bg-oa-navy focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-oa-cyan"
          >
            Skip to map filters
          </a>
        </header>

        <Suspense fallback={<ExplorerSectionLoading />}>
          <DataExplorerLoaded />
        </Suspense>
      </div>
    </section>
  );
}
