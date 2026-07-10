import type { GeoCountry, GeoHierarchy, GeoRegion } from "./geo-hierarchy";
import type { ExplorerFilterOption } from "./explore-filters";

/**
 * Area selection as a minimal set of refs: `country:{id}`,
 * `region:{countryId}:{regionId}`, or `district:{name}`. When all of a node's
 * children are picked they collapse into the parent ref, so each selection
 * has one form, which is also the API payload (split into country/region/
 * district codes).
 *
 * Always compute against the full hierarchy, never a filter-narrowed one, so a
 * country ref can't pull in areas hidden by another active filter.
 */
export type AreaRef = string;

export type AreaCheckState = "checked" | "indeterminate" | "unchecked";

export type AreaCodeParams = {
  country: string[];
  region: string[];
  district: string[];
};

const COUNTRY = "country:";
const REGION = "region:";
const DISTRICT = "district:";

export function countryRef(countryId: string): AreaRef {
  return `${COUNTRY}${countryId}`;
}

export function regionRef(countryId: string, regionId: string): AreaRef {
  return `${REGION}${countryId}:${regionId}`;
}

export function districtRef(name: string): AreaRef {
  return `${DISTRICT}${name}`;
}

type ParsedRef =
  | { level: "country"; countryId: string }
  | { level: "region"; countryId: string; regionId: string }
  | { level: "district"; name: string };

function parseRef(ref: string): ParsedRef | null {
  if (ref.startsWith(COUNTRY)) {
    return { level: "country", countryId: ref.slice(COUNTRY.length) };
  }
  if (ref.startsWith(REGION)) {
    const rest = ref.slice(REGION.length);
    const idx = rest.indexOf(":");
    if (idx === -1) return null;
    return {
      level: "region",
      countryId: rest.slice(0, idx),
      regionId: rest.slice(idx + 1),
    };
  }
  if (ref.startsWith(DISTRICT)) {
    return { level: "district", name: ref.slice(DISTRICT.length) };
  }
  return null;
}

/** A country whose districts sit directly under it (no real region tier). */
function isSingleRegionCountry(country: GeoCountry): boolean {
  return country.regions.length === 1 && country.regions[0]?.id === country.id;
}

function districtNamesOfRegion(region: GeoRegion): string[] {
  return region.areas.map((a) => a.name);
}

function districtNamesOfCountry(country: GeoCountry): string[] {
  return country.regions.flatMap(districtNamesOfRegion);
}

/** Expand a covering set into the full set of district names it covers. */
export function expandRefsToDistrictNames(
  areas: string[],
  hierarchy: GeoHierarchy
): Set<string> {
  const covered = new Set<string>();
  for (const ref of areas) {
    const parsed = parseRef(ref);
    if (!parsed) continue;

    if (parsed.level === "district") {
      covered.add(parsed.name);
      continue;
    }

    if (parsed.level === "country") {
      const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
      if (country) {
        for (const name of districtNamesOfCountry(country)) covered.add(name);
      }
      continue;
    }

    const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
    const region = country?.regions.find((r) => r.id === parsed.regionId);
    if (region) {
      for (const name of districtNamesOfRegion(region)) covered.add(name);
    }
  }
  return covered;
}

/**
 * Re-derive the minimal canonical ref set from a set of covered districts.
 * Full region -> region ref; full country -> country ref; single-region
 * countries collapse straight to a country ref (never a region ref).
 */
export function minimizeDistrictsToRefs(
  covered: Set<string>,
  hierarchy: GeoHierarchy
): string[] {
  const refs: string[] = [];

  for (const country of hierarchy.countries) {
    const regions = country.regions;
    const regionFull = regions.map(
      (r) => r.areas.length > 0 && r.areas.every((a) => covered.has(a.name))
    );
    const countryFull = regions.length > 0 && regionFull.every(Boolean);

    if (countryFull) {
      refs.push(countryRef(country.id));
      continue;
    }

    const single = isSingleRegionCountry(country);
    regions.forEach((region, i) => {
      if (regionFull[i] && !single) {
        refs.push(regionRef(country.id, region.id));
        return;
      }
      for (const area of region.areas) {
        if (covered.has(area.name)) refs.push(districtRef(area.name));
      }
    });
  }

  return refs;
}

function setDistrictsSelected(
  areas: string[],
  hierarchy: GeoHierarchy,
  names: string[],
  selected: boolean
): string[] {
  const covered = expandRefsToDistrictNames(areas, hierarchy);
  for (const name of names) {
    if (selected) covered.add(name);
    else covered.delete(name);
  }
  return minimizeDistrictsToRefs(covered, hierarchy);
}

/** Select or deselect a whole country (cascades to all its districts). */
export function setCountrySelected(
  areas: string[],
  hierarchy: GeoHierarchy,
  countryId: string,
  selected: boolean
): string[] {
  const country = hierarchy.countries.find((c) => c.id === countryId);
  if (!country) return areas;
  return setDistrictsSelected(
    areas,
    hierarchy,
    districtNamesOfCountry(country),
    selected
  );
}

/** Select or deselect a whole region (cascades to its districts). */
export function setRegionSelected(
  areas: string[],
  hierarchy: GeoHierarchy,
  countryId: string,
  regionId: string,
  selected: boolean
): string[] {
  const country = hierarchy.countries.find((c) => c.id === countryId);
  const region = country?.regions.find((r) => r.id === regionId);
  if (!region) return areas;
  return setDistrictsSelected(
    areas,
    hierarchy,
    districtNamesOfRegion(region),
    selected
  );
}

/** Select or deselect a single district by name. */
export function setDistrictSelected(
  areas: string[],
  hierarchy: GeoHierarchy,
  name: string,
  selected: boolean
): string[] {
  return setDistrictsSelected(areas, hierarchy, [name], selected);
}

/**
 * Resolve a map feature to the hierarchy district name used by filters/API.
 * Prefers an exact name match, then falls back to matching geo_code when the
 * basemap label differs from the /areas hierarchy label.
 */
export function resolveDistrictNameFromMap(
  hierarchy: GeoHierarchy,
  name: string,
  code?: string
): string | null {
  let byCode: string | null = null;
  for (const country of hierarchy.countries) {
    for (const region of country.regions) {
      for (const area of region.areas) {
        if (area.name === name) return area.name;
        if (code && area.geoCode === code) byCode = area.name;
      }
    }
  }
  return byCode;
}

function stateFromCounts(coveredCount: number, total: number): AreaCheckState {
  if (total === 0 || coveredCount === 0) return "unchecked";
  if (coveredCount === total) return "checked";
  return "indeterminate";
}

function countCovered(covered: Set<string>, names: string[]): number {
  let n = 0;
  for (const name of names) if (covered.has(name)) n++;
  return n;
}

/**
 * Tri-state for a country row. `covered` is the precomputed
 * expandRefsToDistrictNames result, so the picker computes it once per render.
 */
export function getCountryCheckState(
  covered: Set<string>,
  hierarchy: GeoHierarchy,
  countryId: string
): AreaCheckState {
  const country = hierarchy.countries.find((c) => c.id === countryId);
  if (!country) return "unchecked";
  const names = districtNamesOfCountry(country);
  return stateFromCounts(countCovered(covered, names), names.length);
}

/** Tri-state for a region row. */
export function getRegionCheckState(
  covered: Set<string>,
  hierarchy: GeoHierarchy,
  countryId: string,
  regionId: string
): AreaCheckState {
  const country = hierarchy.countries.find((c) => c.id === countryId);
  const region = country?.regions.find((r) => r.id === regionId);
  if (!region) return "unchecked";
  const names = districtNamesOfRegion(region);
  return stateFromCounts(countCovered(covered, names), names.length);
}

/** Whether a district row is selected. */
export function isDistrictSelected(
  covered: Set<string>,
  name: string
): boolean {
  return covered.has(name);
}

/** Partition the covering set into the country/region/district code arrays the API expects. */
export function partitionAreaRefsToCodes(
  areas: string[],
  hierarchy: GeoHierarchy
): AreaCodeParams {
  const country: string[] = [];
  const region: string[] = [];
  const district: string[] = [];

  let districtCodeByName: Map<string, string> | null = null;
  const getDistrictCode = (name: string): string | undefined => {
    if (!districtCodeByName) {
      districtCodeByName = new Map();
      for (const c of hierarchy.countries) {
        for (const r of c.regions) {
          for (const a of r.areas) districtCodeByName.set(a.name, a.geoCode);
        }
      }
    }
    return districtCodeByName.get(name);
  };

  for (const ref of areas) {
    const parsed = parseRef(ref);
    if (!parsed) continue;

    if (parsed.level === "country") {
      const c = hierarchy.countries.find((x) => x.id === parsed.countryId);
      if (c) country.push(c.code);
    } else if (parsed.level === "region") {
      const c = hierarchy.countries.find((x) => x.id === parsed.countryId);
      const r = c?.regions.find((x) => x.id === parsed.regionId);
      if (r) region.push(r.code);
    } else {
      const code = getDistrictCode(parsed.name);
      if (code) district.push(code);
    }
  }

  return { country, region, district };
}

/** All district names covered by the selection, for map highlighting. */
export function getSelectedDistrictNames(
  areas: string[],
  hierarchy: GeoHierarchy
): string[] {
  return [...expandRefsToDistrictNames(areas, hierarchy)];
}

/** Trigger label: "All areas" | a single nice label | "N areas selected". */
export function getAreaSelectionLabel(
  areas: string[],
  hierarchy: GeoHierarchy
): string {
  if (areas.length === 0) return "All areas";

  if (areas.length === 1) {
    const parsed = parseRef(areas[0]);
    if (parsed?.level === "country") {
      const c = hierarchy.countries.find((x) => x.id === parsed.countryId);
      if (c) return c.label;
    } else if (parsed?.level === "region") {
      const c = hierarchy.countries.find((x) => x.id === parsed.countryId);
      const r = c?.regions.find((x) => x.id === parsed.regionId);
      if (c && r) return `${c.label} › ${r.label}`;
    } else if (parsed?.level === "district") {
      return parsed.name;
    }
  }

  return `${areas.length} areas selected`;
}

// NHS analogue of getAreaSelectionLabel: "All NHS Trusts" | a single trust name
// | "N Trusts". Codes are looked up in the picker's options for the name.
export function getNhsTrustLabel(
  codes: string[],
  options: ExplorerFilterOption[]
): string {
  if (codes.length === 0) return "All NHS Trusts";
  if (codes.length === 1) {
    const opt = options.find((o) => o.value === codes[0]);
    return opt?.label ?? "1 Trust";
  }
  return `${codes.length} Trusts`;
}
