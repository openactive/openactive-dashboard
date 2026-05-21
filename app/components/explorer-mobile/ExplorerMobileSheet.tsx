"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { MobilePanel } from "../../lib/explorer-types";

const SHEET_META: Record<
  Exclude<MobilePanel, "none">,
  { id: string; titleId: string; title: string; sizeClass: string; bodyClass: string }
> = {
  filters: {
    id: "explorer-filters-sheet",
    titleId: "explorer-filters-sheet-title",
    title: "Refine your view",
    sizeClass: "h-auto min-h-[62dvh] max-h-[82dvh] overflow-visible",
    bodyClass: "overflow-visible",
  },
  stats: {
    id: "explorer-stats-sheet",
    titleId: "explorer-stats-sheet-title",
    title: "Selection details",
    sizeClass: "max-h-[min(70dvh,520px)] overflow-hidden",
    bodyClass: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
  },
};

interface ExplorerMobileSheetProps {
  panel: Exclude<MobilePanel, "none">;
  onClose: () => void;
  children: ReactNode;
}

export function ExplorerMobileSheet({ panel, onClose, children }: ExplorerMobileSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { id, titleId, title, sizeClass, bodyClass } = SHEET_META[panel];

  useEffect(() => {
    dialogRef.current
      ?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ?.focus();
  }, [panel]);

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-30 cursor-default bg-transparent"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 z-40 flex w-full flex-col rounded-t-2xl bg-white shadow-[0_-12px_48px_rgba(34,53,130,0.18)] ${sizeClass}`}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-oa-grey-300" aria-hidden="true" />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-oa-grey-200 px-4 py-3">
          <h3 id={titleId} className="text-base font-semibold text-oa-navy">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold text-oa-cyan hover:bg-oa-grey-50 focus:outline-none focus:ring-2 focus:ring-oa-cyan"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            Done
          </button>
        </header>

        <div className={`bg-white px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${bodyClass}`}>
          {children}
        </div>
      </div>
    </>
  );
}
