import { ALL_FILTER } from "../../lib/explore-filters";
import type { GeoCountry, GeoHierarchy, GeoRegion } from "../../lib/geo-hierarchy";
import { AreaPickerRow } from "./AreaPickerRow";
import type { DrillLevel } from "./types";

interface AreaPickerListProps {
  drill: DrillLevel;
  hierarchy: GeoHierarchy;
  query: string;
  districtsWithData: Set<string>;
  onSelectScope: (scope: string) => void;
  onSelectArea: (name: string) => void;
  onDrillCountry: (country: GeoCountry) => void;
  onDrillRegion: (country: GeoCountry, region: GeoRegion) => void;
}

export function AreaPickerList({
  drill,
  hierarchy,
  query,
  districtsWithData,
  onSelectScope,
  onSelectArea,
  onDrillCountry,
  onDrillRegion,
}: AreaPickerListProps) {
  if (drill.type === "root") {
    return (
      <>
        <AreaPickerRow
          label="All areas"
          subLabel="United Kingdom & Ireland"
          onSelect={() => onSelectScope(ALL_FILTER)}
        />
        {hierarchy.countries.map((country) => (
          <AreaPickerRow
            key={country.id}
            label={country.label}
            subLabel={`${country.regions.length} regions`}
            hasChildren
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
          subLabel={
            districtsWithData.has(area.name) ? "Has data" : "No data in extract"
          }
          muted={!districtsWithData.has(area.name)}
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
