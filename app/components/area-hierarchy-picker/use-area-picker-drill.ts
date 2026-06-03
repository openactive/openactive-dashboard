import { useCallback, useEffect, useState } from "react";
import type { ExplorerFilters } from "../../lib/explore-filters";
import { selectArea, selectAreaScope } from "../../lib/explore-filters";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../../lib/geo-hierarchy";
import {
  drillLevelForSelection,
  getBackLabel,
  getPanelTitle,
  goBackDrill,
} from "./drill-level";
import type { DrillLevel } from "./types";

export function useAreaPickerDrill(
  hierarchy: GeoHierarchy,
  filters: ExplorerFilters,
  onChange: (filters: ExplorerFilters) => void,
  open: boolean,
  closePicker: () => void
) {
  const [drill, setDrill] = useState<DrillLevel>({ type: "root" });
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    setDrill(
      drillLevelForSelection(hierarchy, filters.district, filters.areaScope)
    );
  }, [open, hierarchy, filters.district, filters.areaScope]);

  const goBack = useCallback(() => {
    setDrill((current) => goBackDrill(current));
    setQuery("");
  }, []);

  const applyScope = useCallback(
    (scope: string) => {
      onChange(selectAreaScope(filters, scope));
      closePicker();
    },
    [filters, onChange, closePicker]
  );

  const applyArea = useCallback(
    (name: string) => {
      onChange(selectArea(filters, name));
      closePicker();
    },
    [filters, onChange, closePicker]
  );

  const drillToCountry = useCallback(
    (country: GeoCountry) => {
      onChange(selectAreaScope(filters, `country:${country.id}`));
      setQuery("");

      if (country.regions.length === 1 && country.regions[0]) {
        setDrill({ type: "region", country, region: country.regions[0] });
        return;
      }

      setDrill({ type: "country", country });
    },
    [filters, onChange]
  );

  const drillToRegion = useCallback(
    (country: GeoCountry, region: GeoRegion) => {
      onChange(selectAreaScope(filters, `region:${country.id}:${region.id}`));
      setQuery("");
      setDrill({ type: "region", country, region });
    },
    [filters, onChange]
  );

  return {
    drill,
    query,
    setQuery,
    goBack,
    applyScope,
    applyArea,
    drillToCountry,
    drillToRegion,
    panelTitle: getPanelTitle(drill),
    backLabel: getBackLabel(drill),
  };
}
