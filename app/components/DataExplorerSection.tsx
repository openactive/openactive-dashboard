import { readFileSync } from "fs";
import { join } from "path";
import { DataExplorer } from "./DataExplorer";
import { parseExplorerCsv } from "../lib/explore-csv";
import { loadGeoHierarchy } from "../lib/geo-hierarchy.server";

function loadExplorerRows() {
  const csvPath = join(process.cwd(), "app/data/newdata.csv");
  const content = readFileSync(csvPath, "utf8");
  return parseExplorerCsv(content);
}

/**
 * Layer 2 — Interactive Data Explorer (home page section).
 * Anchored at #data for in-page navigation from the hero CTA.
 */
export function DataExplorerSection() {
  const rows = loadExplorerRows();
  const hierarchy = loadGeoHierarchy();

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
        </header>

        <DataExplorer rows={rows} hierarchy={hierarchy} />
      </div>
    </section>
  );
}
