/** Visual placeholder while a page of records is loading. */
export function RecordCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
    >
      <div className="aspect-[16/9] w-full animate-pulse bg-slate-200" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
