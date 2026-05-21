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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          <h2
            id="explorer-heading"
            className="text-3xl sm:text-4xl font-bold text-oa-indigo tracking-tight"
          >
            Interactive Data Explorer
          </h2>
          <p className="mt-4 text-base sm:text-lg text-oa-grey-700 leading-relaxed">
            Explore the breakdown of OpenActive opportunity data by geography,
            data publisher, activity provider and activity.
          </p>
        </header>
      </div>
    </section>
  );
}
