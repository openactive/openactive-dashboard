import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExplorerFilters } from "../../lib/explore-filters";
import {
  expandRefsToDistrictNames,
  setCountrySelected,
  setDistrictSelected,
  setRegionSelected,
} from "../../lib/area-selection";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../../lib/geo-hierarchy";
import { getBackLabel, getPanelTitle, goBackDrill } from "./drill-level";
import type { DrillLevel } from "./types";

function sameAreas(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

/**
 * Drill navigation plus a draft area selection that only commits when the
 * panel closes, so toggling several areas fires one filter update instead of
 * one request fan-out per click.
 */
export function useAreaPickerDrill(
  hierarchy: GeoHierarchy,
  filters: ExplorerFilters,
  onChange: (filters: ExplorerFilters) => void,
  open: boolean
) {
  const [drill, setDrill] = useState<DrillLevel>({ type: "root" });
  const [query, setQuery] = useState("");
  const [draftAreas, setDraftAreas] = useState<string[]>(filters.areas);

  const wasOpenRef = useRef(open);

  // Reset the draft from committed filters when opening; commit it on close.
  // This runs every render but acts only on the open/closed transition, so it
  // always sees the latest draft without re-subscribing on every toggle.
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;

    if (open && !wasOpen) {
      setDraftAreas(filters.areas);
      setDrill({ type: "root" });
      setQuery("");
    } else if (!open && wasOpen) {
      if (!sameAreas(draftAreas, filters.areas)) {
        onChange({ ...filters, areas: draftAreas });
      }
    }
  }, [open, filters, draftAreas, onChange]);

  const covered = useMemo(
    () => expandRefsToDistrictNames(draftAreas, hierarchy),
    [draftAreas, hierarchy]
  );

  const toggleCountry = useCallback(
    (country: GeoCountry, selected: boolean) => {
      setDraftAreas((current) =>
        setCountrySelected(current, hierarchy, country.id, selected)
      );
    },
    [hierarchy]
  );

  const toggleRegion = useCallback(
    (country: GeoCountry, region: GeoRegion, selected: boolean) => {
      setDraftAreas((current) =>
        setRegionSelected(current, hierarchy, country.id, region.id, selected)
      );
    },
    [hierarchy]
  );

  const toggleDistrict = useCallback(
    (name: string, selected: boolean) => {
      setDraftAreas((current) =>
        setDistrictSelected(current, hierarchy, name, selected)
      );
    },
    [hierarchy]
  );

  const goBack = useCallback(() => {
    setDrill((current) => goBackDrill(current));
    setQuery("");
  }, []);

  const drillToCountry = useCallback((country: GeoCountry) => {
    setQuery("");
    if (country.regions.length === 1 && country.regions[0]) {
      setDrill({ type: "region", country, region: country.regions[0] });
      return;
    }
    setDrill({ type: "country", country });
  }, []);

  const drillToRegion = useCallback((country: GeoCountry, region: GeoRegion) => {
    setQuery("");
    setDrill({ type: "region", country, region });
  }, []);

  return {
    drill,
    query,
    setQuery,
    covered,
    draftAreas,
    toggleCountry,
    toggleRegion,
    toggleDistrict,
    goBack,
    drillToCountry,
    drillToRegion,
    panelTitle: getPanelTitle(drill),
    backLabel: getBackLabel(drill),
  };
}
