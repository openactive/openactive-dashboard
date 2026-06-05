"use client";

import { useCallback } from "react";
import { ExplorerFilterBar } from "../ExplorerFilterBar";
import { ExplorerSummary } from "../ExplorerSummary";
import { ExplorerMobileFilterButton } from "./ExplorerMobileFilterButton";
import { ExplorerMobileSheet } from "./ExplorerMobileSheet";
import { ExplorerMobileStatsDock } from "./ExplorerMobileStatsDock";
import { useEscapeClose } from "../../hooks/useEscapeClose";
import type { ExplorerMobileChromeProps } from "../../lib/explorer-types";

export type { MobilePanel, ExplorerMobileChromeProps } from "../../lib/explorer-types";

/**
 * Mobile/tablet chrome: filter trigger, stats dock, and slide-up sheets.
 * Keeps the map clear by default — panels open on demand.
 */
export function ExplorerMobileChrome({
  panel,
  onPanelChange,
  summary,
  selectionLabel,
  filterProps,
  isLoading,
}: ExplorerMobileChromeProps) {
  const closePanel = useCallback(() => onPanelChange("none"), [onPanelChange]);

  const toggleFilters = useCallback(() => {
    onPanelChange(panel === "filters" ? "none" : "filters");
  }, [panel, onPanelChange]);

  useEscapeClose(panel !== "none", closePanel);

  const sheetOpen = panel !== "none";

  return (
    <>
      <div inert={sheetOpen ? true : undefined}>
        <ExplorerMobileFilterButton
          panel={panel}
          onToggleFilters={toggleFilters}
        />

        <ExplorerMobileStatsDock
          panel={panel}
          summary={summary}
          selectionLabel={selectionLabel}
          onOpenStats={() => onPanelChange("stats")}
          isLoading={isLoading}
        />
      </div>

      {sheetOpen && (
        <ExplorerMobileSheet panel={panel} onClose={closePanel}>
          {panel === "filters" ? (
            <ExplorerFilterBar layout="sheet" {...filterProps} />
          ) : (
            <ExplorerSummary
              layout="sheet"
              summary={summary}
              selectionLabel={selectionLabel}
              isLoading={isLoading}
              onNavigateAway={closePanel}
            />
          )}
        </ExplorerMobileSheet>
      )}
    </>
  );
}
