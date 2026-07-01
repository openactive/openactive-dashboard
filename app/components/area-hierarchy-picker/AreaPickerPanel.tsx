import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useMemo, type RefObject } from "react";
import {
  EXPLORER_GLASS_BACKDROP_BLUR_MD,
  EXPLORER_SHADOW_LG,
} from "../../lib/explorer-ui-styles";
import {
  searchAreasGlobal,
  searchAreasInCountry,
  type AreaSearchHit,
} from "../../lib/area-search";
import { AreaPickerList } from "./AreaPickerList";
import { BoundaryChoiceList } from "./BoundaryChoiceList";
import { NhsTrustList } from "./NhsTrustList";
import type { AreaPickerVariant, DrillLevel } from "./types";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../../lib/geo-hierarchy";
import type {
  BoundaryType,
  ExplorerFilterOption,
} from "../../lib/explore-filters";
import type { NhsTrustOptionsStatus } from "../../hooks/useNhsTrustOptions";

interface AreaPickerPanelProps {
  listboxId: string;
  titleId: string;
  variant: AreaPickerVariant;
  drill: DrillLevel;
  query: string;
  panelTitle: string;
  backLabel: string;
  hierarchy: GeoHierarchy;
  covered: Set<string>;
  listRef: RefObject<HTMLUListElement | null>;
  backRef: RefObject<HTMLButtonElement | null>;
  onQueryChange: (value: string) => void;
  onGoBack: () => void;
  onToggleCountry: (country: GeoCountry, selected: boolean) => void;
  onToggleRegion: (
    country: GeoCountry,
    region: GeoRegion,
    selected: boolean
  ) => void;
  onToggleDistrict: (name: string, selected: boolean) => void;
  onDrillCountry: (country: GeoCountry) => void;
  onDrillRegion: (country: GeoCountry, region: GeoRegion) => void;
  boundaryType: BoundaryType;
  onChooseBoundary: (type: BoundaryType) => void;
  nhsOptions: ExplorerFilterOption[];
  nhsStatus: NhsTrustOptionsStatus;
  selectedNhsTrusts: string[];
  onToggleNhsTrust: (code: string, selected: boolean) => void;
}

function getSearchInputCopy(drill: DrillLevel): {
  placeholder: string;
  srLabel: string;
} {
  switch (drill.type) {
    case "nhs":
      return {
        placeholder: "Search NHS Trusts…",
        srLabel: "Search NHS Trusts",
      };
    case "root":
      return {
        placeholder: "Search any district…",
        srLabel: "Search districts across all countries",
      };
    case "country":
      return {
        placeholder: `Search districts in ${drill.country.label}…`,
        srLabel: `Search districts in ${drill.country.label}`,
      };
    case "region":
      return {
        placeholder: "Search areas…",
        srLabel: `Search areas in ${drill.region.label}`,
      };
    case "boundary-choice":
      return { placeholder: "", srLabel: "" };
  }
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
  covered,
  listRef,
  backRef,
  onQueryChange,
  onGoBack,
  onToggleCountry,
  onToggleRegion,
  onToggleDistrict,
  onDrillCountry,
  onDrillRegion,
  boundaryType,
  onChooseBoundary,
  nhsOptions,
  nhsStatus,
  selectedNhsTrusts,
  onToggleNhsTrust,
}: AreaPickerPanelProps) {
  const isGlass = variant === "glass";
  const isSheet = variant === "sheet";
  const showSearch =
    drill.type === "nhs" ||
    drill.type === "root" ||
    drill.type === "country" ||
    (drill.type === "region" && drill.region.areas.length > 8);
  const searchCopy = getSearchInputCopy(drill);

  const trimmedQuery = query.trim();
  const searchResults = useMemo<AreaSearchHit[] | null>(() => {
    if (!trimmedQuery) return null;
    if (drill.type === "root") {
      return searchAreasGlobal(hierarchy, trimmedQuery);
    }
    if (drill.type === "country") {
      return searchAreasInCountry(drill.country, trimmedQuery);
    }
    return null;
  }, [drill, trimmedQuery, hierarchy]);

  const liveMessage = useMemo(() => {
    if (!searchResults) return "";
    const count = searchResults.length;
    if (count === 0) return `No districts match "${trimmedQuery}".`;
    if (count === 1) return `1 district matches "${trimmedQuery}".`;
    return `${count} districts match "${trimmedQuery}".`;
  }, [searchResults, trimmedQuery]);

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
            : `overflow-hidden rounded-lg border-oa-grey-200 ${EXPLORER_SHADOW_LG}`
      }`}
    >
      {drill.type === "boundary-choice" ? (
        // Keep an invisible title so the dialog still has an accessible name.
        <p id={titleId} className="sr-only">
          {panelTitle}
        </p>
      ) : (
        <div
          role="toolbar"
          aria-label="Location picker navigation"
          className="flex items-center gap-1 border-b border-oa-grey-200 bg-oa-grey-50 px-2 py-2"
        >
          <button
            ref={backRef}
            type="button"
            className="cursor-pointer rounded-sm p-1.5 text-oa-navy hover:bg-oa-grey-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-oa-cyan"
            onClick={onGoBack}
            aria-label={backLabel}
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <p
            id={titleId}
            className="text-xs font-bold uppercase tracking-wide text-oa-navy"
          >
            {panelTitle}
          </p>
        </div>
      )}

      <p className="sr-only">
        Use each checkbox to select or clear an area; choosing a country or
        region includes all of its districts. Use the chevron or press right
        arrow to browse into a country or region, and the back button or left
        arrow to return. Your selection applies when you close the picker.
      </p>

      {showSearch && (
        <div className="border-b border-oa-grey-200 px-2 py-2">
          <label htmlFor={`${listboxId}-search`} className="sr-only">
            {searchCopy.srLabel}
          </label>
          <input
            id={`${listboxId}-search`}
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchCopy.placeholder}
            className="w-full rounded-sm border border-oa-grey-300 bg-white px-2 py-1.5 text-sm text-oa-grey-800 placeholder:text-oa-grey-400 focus:border-oa-cyan focus:outline-none focus:ring-1 focus:ring-oa-cyan"
          />
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

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
        {drill.type === "boundary-choice" ? (
          <BoundaryChoiceList
            boundaryType={boundaryType}
            onChoose={onChooseBoundary}
          />
        ) : drill.type === "nhs" ? (
          <NhsTrustList
            query={query}
            options={nhsOptions}
            status={nhsStatus}
            selected={selectedNhsTrusts}
            onToggle={onToggleNhsTrust}
          />
        ) : (
          <AreaPickerList
            drill={drill}
            hierarchy={hierarchy}
            query={query}
            covered={covered}
            searchResults={searchResults}
            onToggleCountry={onToggleCountry}
            onToggleRegion={onToggleRegion}
            onToggleDistrict={onToggleDistrict}
            onDrillCountry={onDrillCountry}
            onDrillRegion={onDrillRegion}
          />
        )}
      </ul>
    </div>
  );
}
