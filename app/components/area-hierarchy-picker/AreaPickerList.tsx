import { ALL_FILTER, type ExplorerFilters } from "../../lib/explore-filters";
import {
  parseAreaScope,
  type GeoCountry,
  type GeoHierarchy,
  type GeoRegion,
} from "../../lib/geo-hierarchy";
import { AreaPickerRow } from "./AreaPickerRow";
import type { DrillLevel } from "./types";

interface AreaPickerListProps {
  drill: DrillLevel;
  hierarchy: GeoHierarchy;
  query: string;
  filters: ExplorerFilters;
  onSelectScope: (scope: string) => void;
  onSelectArea: (name: string) => void;
  onDrillCountry: (country: GeoCountry) => void;
  onDrillRegion: (country: GeoCountry, region: GeoRegion) => void;
}

/**
 * Locate the country/region that the current selection lives under,
 * so we can highlight ancestors at any drill level.
 */
function getSelectionAncestors(
  hierarchy: GeoHierarchy,
  filters: ExplorerFilters
): { countryId?: string; regionId?: string } {
  if (filters.district !== ALL_FILTER) {
    for (const country of hierarchy.countries) {
      for (const region of country.regions) {
        if (region.areas.some((a) => a.name === filters.district)) {
          return { countryId: country.id, regionId: region.id };
        }
      }
    }
    return {};
  }

  const parsed = parseAreaScope(filters.areaScope);
  return { countryId: parsed.countryId, regionId: parsed.regionId };
}

export function AreaPickerList({
  drill,
  hierarchy,
  query,
  filters,
  onSelectScope,
  onSelectArea,
  onDrillCountry,
  onDrillRegion,
}: AreaPickerListProps) {
  const { countryId, regionId } = getSelectionAncestors(hierarchy, filters);
  const isAllSelected =
    filters.district === ALL_FILTER && filters.areaScope === ALL_FILTER;

  if (drill.type === "root") {
    return (
      <>
        <AreaPickerRow
          label="All areas"
          subLabel="United Kingdom & Ireland"
          selected={isAllSelected}
          onSelect={() => onSelectScope(ALL_FILTER)}
        />
        {hierarchy.countries.map((country) => (
          <AreaPickerRow
            key={country.id}
            label={country.label}
            subLabel={`${country.regions.length} regions`}
            hasChildren
            selected={country.id === countryId}
            onSelect={() => onDrillCountry(country)}
          />
        ))}
      </>
    );
  }

  if (drill.type === "country") {
    return (
      <>
        {drill.country.regions.map((region) => (
          <AreaPickerRow
            key={region.id}
            label={region.label}
            subLabel={`${region.areas.length} areas`}
            hasChildren
            selected={
              drill.country.id === countryId && region.id === regionId
            }
            onSelect={() => onDrillRegion(drill.country, region)}
          />
        ))}
      </>
    );
  }

  const q = query.trim().toLowerCase();
  const areas = drill.region.areas.filter((a) =>
    q ? a.name.toLowerCase().includes(q) : true
  );

  return (
    <>
      {areas.map((area) => (
        <AreaPickerRow
          key={area.geoCode}
          label={area.name}
          selected={area.name === filters.district}
          onSelect={() => onSelectArea(area.name)}
        />
      ))}
      {areas.length === 0 && (
        <li className="px-4 py-6 text-center text-sm text-oa-grey-500">
          No areas match your search.
        </li>
      )}
    </>
  );
}
