import {
  getCountryCheckState,
  getRegionCheckState,
  isDistrictSelected,
} from "../../lib/area-selection";
import type {
  GeoCountry,
  GeoHierarchy,
  GeoRegion,
} from "../../lib/geo-hierarchy";
import type { AreaSearchHit } from "../../lib/area-search";
import { scoreAreaMatch } from "../../lib/area-search";
import { AreaPickerRow } from "./AreaPickerRow";
import type { DrillLevel } from "./types";

interface AreaPickerListProps {
  drill: DrillLevel;
  hierarchy: GeoHierarchy;
  query: string;
  covered: Set<string>;
  searchResults: AreaSearchHit[] | null;
  onToggleCountry: (country: GeoCountry, selected: boolean) => void;
  onToggleRegion: (
    country: GeoCountry,
    region: GeoRegion,
    selected: boolean
  ) => void;
  onToggleDistrict: (name: string, selected: boolean) => void;
  onDrillCountry: (country: GeoCountry) => void;
  onDrillRegion: (country: GeoCountry, region: GeoRegion) => void;
}

/** "3 regions" / "12 areas" — single-region countries list districts directly. */
function countrySubLabel(country: GeoCountry): string {
  if (country.regions.length === 1) {
    const n = country.regions[0]?.areas.length ?? 0;
    return `${n} ${n === 1 ? "area" : "areas"}`;
  }
  return `${country.regions.length} regions`;
}

export function AreaPickerList({
  drill,
  hierarchy,
  query,
  covered,
  searchResults,
  onToggleCountry,
  onToggleRegion,
  onToggleDistrict,
  onDrillCountry,
  onDrillRegion,
}: AreaPickerListProps) {
  if (searchResults) {
    if (searchResults.length === 0) {
      return (
        <li className="px-4 py-6 text-center text-sm text-oa-grey-500">
          No districts match your search.
        </li>
      );
    }
    return (
      <>
        {searchResults.map((hit) => {
          const checked = isDistrictSelected(covered, hit.name);
          return (
            <AreaPickerRow
              key={`${hit.countryId}:${hit.regionId}:${hit.geoCode}`}
              label={hit.name}
              subLabel={`${hit.countryLabel} › ${hit.regionLabel}`}
              checkState={checked ? "checked" : "unchecked"}
              onToggle={() => onToggleDistrict(hit.name, !checked)}
            />
          );
        })}
      </>
    );
  }

  if (drill.type === "root") {
    return (
      <>
        {hierarchy.countries.map((country) => {
          const state = getCountryCheckState(covered, hierarchy, country.id);
          return (
            <AreaPickerRow
              key={country.id}
              label={country.label}
              subLabel={countrySubLabel(country)}
              checkState={state}
              hasChildren
              onToggle={() => onToggleCountry(country, state !== "checked")}
              onDrill={() => onDrillCountry(country)}
            />
          );
        })}
      </>
    );
  }

  if (drill.type === "country") {
    return (
      <>
        {drill.country.regions.map((region) => {
          const state = getRegionCheckState(
            covered,
            hierarchy,
            drill.country.id,
            region.id
          );
          return (
            <AreaPickerRow
              key={region.id}
              label={region.label}
              subLabel={`${region.areas.length} areas`}
              checkState={state}
              hasChildren
              onToggle={() =>
                onToggleRegion(drill.country, region, state !== "checked")
              }
              onDrill={() => onDrillRegion(drill.country, region)}
            />
          );
        })}
      </>
    );
  }

  const trimmed = query.trim();
  const areas = trimmed
    ? drill.region.areas
        .map((area) => ({ area, score: scoreAreaMatch(area.name, trimmed) }))
        .filter((x) => x.score !== -Infinity)
        .sort(
          (a, b) =>
            b.score - a.score || a.area.name.localeCompare(b.area.name)
        )
        .map((x) => x.area)
    : drill.region.areas;

  return (
    <>
      {areas.map((area) => {
        const checked = isDistrictSelected(covered, area.name);
        return (
          <AreaPickerRow
            key={area.geoCode}
            label={area.name}
            checkState={checked ? "checked" : "unchecked"}
            onToggle={() => onToggleDistrict(area.name, !checked)}
          />
        );
      })}
      {areas.length === 0 && (
        <li className="px-4 py-6 text-center text-sm text-oa-grey-500">
          No areas match your search.
        </li>
      )}
    </>
  );
}
