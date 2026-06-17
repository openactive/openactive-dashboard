import type { GeoCountry, GeoHierarchy } from "./geo-hierarchy";

export type AreaSearchHit = {
  name: string;
  geoCode: string;
  regionLabel: string;
  regionId: string;
  countryLabel: string;
  countryId: string;
  score: number;
};

/** Lowercase, strip diacritics, trim. Used by every match check. */
function normalizeAreaName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** Characters that mark the start of a new word in an area name. */
const WORD_BOUNDARY = /[\s\-'.,&]/;

function isAtWordStart(s: string, idx: number): boolean {
  if (idx <= 0) return true;
  return WORD_BOUNDARY.test(s[idx - 1] ?? "");
}

/** How far apart the subsequence characters are; null = no subsequence match. */
function subsequenceSpread(name: string, query: string): number | null {
  let firstIdx = -1;
  let lastIdx = -1;
  let qi = 0;
  for (let i = 0; i < name.length && qi < query.length; i++) {
    if (name[i] === query[qi]) {
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
      qi++;
    }
  }
  if (qi !== query.length) return null;
  return lastIdx - firstIdx;
}

/**
 * Tiered score: exact > word-start prefix > substring > subsequence.
 * Returns -Infinity when no match.
 */
export function scoreAreaMatch(name: string, query: string): number {
  const q = normalizeAreaName(query);
  if (!q) return 0;
  const n = normalizeAreaName(name);

  if (n === q) return 10_000;

  const idx = n.indexOf(q);
  if (idx !== -1) {
    const positional = idx * 10 + n.length * 0.5;
    return (isAtWordStart(n, idx) ? 5_000 : 1_000) - positional;
  }

  const spread = subsequenceSpread(n, q);
  if (spread === null) return -Infinity;
  return 100 - spread;
}

/** Score desc, then alphabetical for stable tie-break. */
function compareHits(a: AreaSearchHit, b: AreaSearchHit): number {
  if (b.score !== a.score) return b.score - a.score;
  return a.name.localeCompare(b.name);
}

/** Search every district inside one country. Empty query → []. */
export function searchAreasInCountry(
  country: GeoCountry,
  query: string
): AreaSearchHit[] {
  if (!normalizeAreaName(query)) return [];

  const hits: AreaSearchHit[] = [];
  for (const region of country.regions) {
    for (const area of region.areas) {
      const score = scoreAreaMatch(area.name, query);
      if (score === -Infinity) continue;
      hits.push({
        name: area.name,
        geoCode: area.geoCode,
        regionLabel: region.label,
        regionId: region.id,
        countryLabel: country.label,
        countryId: country.id,
        score,
      });
    }
  }
  return hits.sort(compareHits);
}

/** Search every district across every country. Empty query → []. */
export function searchAreasGlobal(
  hierarchy: GeoHierarchy,
  query: string
): AreaSearchHit[] {
  if (!normalizeAreaName(query)) return [];

  const hits: AreaSearchHit[] = [];
  for (const country of hierarchy.countries) {
    for (const region of country.regions) {
      for (const area of region.areas) {
        const score = scoreAreaMatch(area.name, query);
        if (score === -Infinity) continue;
        hits.push({
          name: area.name,
          geoCode: area.geoCode,
          regionLabel: region.label,
          regionId: region.id,
          countryLabel: country.label,
          countryId: country.id,
          score,
        });
      }
    }
  }
  return hits.sort(compareHits);
}
