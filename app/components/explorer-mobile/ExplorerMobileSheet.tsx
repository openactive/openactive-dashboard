"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useFocusTrap } from "../../hooks/useFocusTrap";
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const { id, titleId, title, sizeClass, bodyClass } = SHEET_META[panel];

  useFocusTrap(dialogRef, true, { restoreFocus: false });

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          panel === "filters"
            ? '[aria-controls="explorer-filters-sheet"]'
            : '[aria-controls="explorer-stats-sheet"]'
        )
        ?.focus();
    });
  }, [onClose, panel]);

  useEffect(() => {
    const initial =
      bodyRef.current?.querySelector<HTMLElement>(
        "button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
      ) ?? dialogRef.current?.querySelector<HTMLElement>("button");
    initial?.focus();
  }, [panel]);

  return (
    <>
      <div
        className="absolute inset-0 z-30 cursor-default bg-transparent"
        aria-hidden="true"
        onClick={handleClose}
      />
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-x-0 bottom-0 z-40 flex w-full flex-col rounded-t-2xl bg-white shadow-[0_-12px_48px_rgba(34,53,130,0.18)] ${sizeClass}`}
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-oa-grey-300"
          aria-hidden="true"
        />

        <header className="flex shrink-0 items-center border-b border-oa-grey-200 px-4 py-3">
          <h3 id={titleId} className="text-base font-semibold text-oa-navy">
            {title}
          </h3>
        </header>

        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 bg-white px-4 py-4 ${bodyClass}`}
        >
          {children}
        </div>

        <footer className="shrink-0 border-t border-oa-grey-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleClose}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-oa-navy px-4 py-3 text-sm font-semibold text-white hover:bg-oa-navy/90 focus:outline-none focus:ring-2 focus:ring-oa-cyan focus:ring-offset-2"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            Done — view results
          </button>
        </footer>
      </div>
    </>
  );
}
