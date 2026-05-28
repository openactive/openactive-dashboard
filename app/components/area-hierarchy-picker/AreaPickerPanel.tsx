import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import type { RefObject } from "react";
import {
  EXPLORER_GLASS_BACKDROP_BLUR_MD,
  EXPLORER_SHADOW_LG,
} from "../../lib/explorer-ui-styles";
import { AreaPickerList } from "./AreaPickerList";
import type { AreaPickerVariant, DrillLevel } from "./types";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../../lib/geo-hierarchy";

interface AreaPickerPanelProps {
  listboxId: string;
  titleId: string;
  variant: AreaPickerVariant;
  drill: DrillLevel;
  query: string;
  panelTitle: string;
  backLabel: string;
  hierarchy: GeoHierarchy;
  districtsWithData: Set<string>;
  listRef: RefObject<HTMLUListElement | null>;
  backRef: RefObject<HTMLButtonElement | null>;
  onQueryChange: (value: string) => void;
  onGoBack: () => void;
  onSelectScope: (scope: string) => void;
  onSelectArea: (name: string) => void;
  onDrillCountry: (country: GeoCountry) => void;
  onDrillRegion: (country: GeoCountry, region: GeoRegion) => void;
}

export function AreaPickerPanel({
  listboxId,
  titleId,
  variant,
  drill,
  query,
  panelTitle,
  backLabel,
  hierarchy,
  districtsWithData,
  listRef,
  backRef,
  onQueryChange,
  onGoBack,
  onSelectScope,
  onSelectArea,
  onDrillCountry,
  onDrillRegion,
}: AreaPickerPanelProps) {
  const isGlass = variant === "glass";
  const isSheet = variant === "sheet";
  const showSearch =
    drill.type === "region" && drill.region.areas.length > 8;

  return (
    <div
      id={listboxId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={`absolute left-0 right-0 z-50 mt-1 w-full max-w-full min-w-0 border bg-white ${
        isGlass
          ? `overflow-hidden rounded-lg border-white/90 bg-white/95 ${EXPLORER_SHADOW_LG} ${EXPLORER_GLASS_BACKDROP_BLUR_MD}`
          : isSheet
            ? `overflow-hidden rounded-lg border-oa-grey-200 ${EXPLORER_SHADOW_LG}`
            : "overflow-hidden rounded-sm border-oa-navy shadow-[6px_6px_0_0_#223582]"
      }`}
    >
      <div
        role="toolbar"
        aria-label="Area picker navigation"
        className="flex items-center gap-1 border-b border-oa-grey-200 bg-oa-grey-50 px-2 py-2"
      >
        {drill.type !== "root" && (
          <button
            ref={backRef}
            type="button"
            className="cursor-pointer rounded-sm p-1.5 text-oa-navy hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            onClick={onGoBack}
            aria-label={backLabel}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <p
          id={titleId}
          className="text-xs font-bold uppercase tracking-wide text-oa-navy"
        >
          {panelTitle}
        </p>
      </div>

      <p className="sr-only">
        Tab through options to choose a scope. Leaving the list with Tab closes
        this picker. Use the back button or press left arrow on an option to
        return to the previous level.
      </p>

      {showSearch && (
        <div className="border-b border-oa-grey-200 px-2 py-2">
          <label htmlFor={`${listboxId}-search`} className="sr-only">
            Search areas in {drill.region.label}
          </label>
          <input
            id={`${listboxId}-search`}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search areas…"
            className="w-full rounded-sm border border-oa-grey-300 bg-white px-2 py-1.5 text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:border-oa-cyan focus:outline-none focus:ring-1 focus:ring-oa-cyan"
          />
        </div>
      )}

      <ul
        ref={listRef}
        role="group"
        aria-label={`${panelTitle} options`}
        className={
          isSheet
            ? "max-h-[min(36dvh,380px)] overflow-y-auto"
            : "max-h-60 overflow-y-auto"
        }
      >
        <AreaPickerList
          drill={drill}
          hierarchy={hierarchy}
          query={query}
          districtsWithData={districtsWithData}
          onSelectScope={onSelectScope}
          onSelectArea={onSelectArea}
          onDrillCountry={onDrillCountry}
          onDrillRegion={onDrillRegion}
        />
      </ul>
    </div>
  );
}
