/** Shown while geocoded CSV and hierarchy load (Suspense fallback). */
export function ExplorerSectionLoading() {
  return (
    <div
      className="mt-10 flex min-h-[min(70dvh,42rem)] flex-col items-center justify-center gap-4 rounded-sm border border-oa-grey-200 bg-white px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-oa-grey-200 border-t-oa-cyan"
        aria-hidden
      />
      <p className="text-sm text-oa-grey-700">Loading opportunity data…</p>
    </div>
  );
}
