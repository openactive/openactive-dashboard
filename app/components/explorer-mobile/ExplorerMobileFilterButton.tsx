"use client";

import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { MobilePanel } from "../../lib/explorer-types";

interface ExplorerMobileFilterButtonProps {
  panel: MobilePanel;
  onToggleFilters: () => void;
}

export function ExplorerMobileFilterButton({
  panel,
  onToggleFilters,
}: ExplorerMobileFilterButtonProps) {
  return (
    <div className="absolute top-3 left-3 z-50 pointer-events-auto sm:top-4">
      <button
        type="button"
        onClick={onToggleFilters}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-oa-navy shadow-md ring-1 ring-oa-grey-200/80 hover:bg-oa-grey-50 focus:outline-none focus:ring-2 focus:ring-oa-cyan"
        aria-expanded={panel === "filters"}
        aria-controls="explorer-filters-sheet"
      >
        <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
        Filters
      </button>
    </div>
  );
}
