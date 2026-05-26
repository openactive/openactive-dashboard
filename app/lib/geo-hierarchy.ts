export type GeoArea = {
  id: string;
  name: string;
  geoCode: string;
  geoType: "lad" | "county";
};

export type GeoRegion = {
  id: string;
  label: string;
  areas: GeoArea[];
};

export type GeoCountry = {
  id: string;
  label: string;
  regions: GeoRegion[];
};

export type GeoHierarchy = {
  countries: GeoCountry[];
  /** geo_name → country id */
  areaToCountry: Record<string, string>;
  /** geo_name → region id */
  areaToRegion: Record<string, string>;
};

const ENGLISH_REGION_CENTROIDS: Record<
  string,
  { lat: number; lon: number; label: string }
> = {
  "north-east": { lat: 55.0, lon: -1.8, label: "North East" },
  "north-west": { lat: 54.0, lon: -2.8, label: "North West" },
  yorkshire: { lat: 53.8, lon: -1.2, label: "Yorkshire and the Humber" },
  "east-midlands": { lat: 52.8, lon: -1.0, label: "East Midlands" },
  "west-midlands": { lat: 52.5, lon: -2.0, label: "West Midlands" },
  "east-of-england": { lat: 52.2, lon: 0.5, label: "East of England" },
  london: { lat: 51.45, lon: -0.15, label: "London" },
  "south-east": { lat: 51.0, lon: 0.2, label: "South East" },
  "south-west": { lat: 50.8, lon: -3.5, label: "South West" },
};

interface BoundaryFeature {
  properties: {
    geo_code: string;
    geo_name: string;
    geo_type: string;
    latitude: number;
    longitude: number;
  };
}

interface BoundaryCollection {
  features: BoundaryFeature[];
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function assignEnglishRegionId(lat: number, lon: number): string {
  let bestId = "south-east";
  let bestDist = Infinity;
  for (const [id, centroid] of Object.entries(ENGLISH_REGION_CENTROIDS)) {
    const dist = haversineKm(lat, lon, centroid.lat, centroid.lon);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = id;
    }
  }
  return bestId;
}

function classifyFeature(f: BoundaryFeature): {
  countryId: string;
  countryLabel: string;
  regionId: string;
  regionLabel: string;
  geoType: "lad" | "county";
} {
  const p = f.properties;

  if (p.geo_type === "county") {
    return {
      countryId: "ireland",
      countryLabel: "Republic of Ireland",
      regionId: "ireland",
      regionLabel: "Counties",
      geoType: "county",
    };
  }

  const code = p.geo_code;
  if (code.startsWith("E")) {
    const regionId = assignEnglishRegionId(p.latitude, p.longitude);
    return {
      countryId: "england",
      countryLabel: "England",
      regionId,
      regionLabel: ENGLISH_REGION_CENTROIDS[regionId].label,
      geoType: "lad",
    };
  }
  if (code.startsWith("S")) {
    return {
      countryId: "scotland",
      countryLabel: "Scotland",
      regionId: "scotland",
      regionLabel: "Scotland",
      geoType: "lad",
    };
  }
  if (code.startsWith("W")) {
    return {
      countryId: "wales",
      countryLabel: "Wales",
      regionId: "wales",
      regionLabel: "Wales",
      geoType: "lad",
    };
  }
  if (code.startsWith("N")) {
    return {
      countryId: "northern-ireland",
      countryLabel: "Northern Ireland",
      regionId: "northern-ireland",
      regionLabel: "Northern Ireland",
      geoType: "lad",
    };
  }

  return {
    countryId: "other",
    countryLabel: "Other",
    regionId: "other",
    regionLabel: "Other",
    geoType: "lad",
  };
}

/** Build country → region → area tree from combined-boundaries.geojson */
export function buildGeoHierarchy(geojson: BoundaryCollection): GeoHierarchy {
  const countryMap = new Map<string, GeoCountry>();
  const areaToCountry: Record<string, string> = {};
  const areaToRegion: Record<string, string> = {};

  for (const feature of geojson.features) {
    const p = feature.properties;
    const { countryId, countryLabel, regionId, regionLabel, geoType } =
      classifyFeature(feature);

    if (!countryMap.has(countryId)) {
      countryMap.set(countryId, {
        id: countryId,
        label: countryLabel,
        regions: [],
      });
    }
    const country = countryMap.get(countryId)!;

    let region = country.regions.find((r) => r.id === regionId);
    if (!region) {
      region = { id: regionId, label: regionLabel, areas: [] };
      country.regions.push(region);
    }

    const area: GeoArea = {
      id: p.geo_code,
      name: p.geo_name,
      geoCode: p.geo_code,
      geoType,
    };

    region.areas.push(area);
    areaToCountry[p.geo_name] = countryId;
    areaToRegion[p.geo_name] = regionId;
  }

  const countries = [...countryMap.values()]
    .map((country) => ({
      ...country,
      regions: country.regions
        .map((region) => ({
          ...region,
          areas: region.areas.sort((a, b) =>
            a.name.localeCompare(b.name, "en", { sensitivity: "base" })
          ),
        }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, "en", { sensitivity: "base" })
        ),
    }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, "en", { sensitivity: "base" })
    );

  return { countries, areaToCountry, areaToRegion };
}

/** Scope key: all | country:{id} | region:{countryId}:{regionId} */
export function parseAreaScope(scope: string): {
  type: "all" | "country" | "region";
  countryId?: string;
  regionId?: string;
} {
  if (scope === "all") return { type: "all" };
  if (scope.startsWith("country:")) {
    return { type: "country", countryId: scope.slice(8) };
  }
  if (scope.startsWith("region:")) {
    const [, countryId, regionId] = scope.split(":");
    return { type: "region", countryId, regionId };
  }
  return { type: "all" };
}

export function formatAreaScope(scope: string): string {
  return scope === "all" ? "all" : scope;
}

/** All geo_names within a country or region scope */
export function getAreaNamesInScope(
  hierarchy: GeoHierarchy,
  areaScope: string
): string[] {
  const parsed = parseAreaScope(areaScope);
  if (parsed.type === "all") return [];

  const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
  if (!country) return [];

  if (parsed.type === "country") {
    return country.regions.flatMap((r) => r.areas.map((a) => a.name));
  }

  const region = country.regions.find((r) => r.id === parsed.regionId);
  return region ? region.areas.map((a) => a.name) : [];
}

/** Human-readable label for the current area selection */
export function getAreaSelectionLabel(
  hierarchy: GeoHierarchy,
  district: string,
  areaScope: string
): string {
  if (district !== "all") return district;

  const parsed = parseAreaScope(areaScope);
  if (parsed.type === "all") return "All areas";

  const country = hierarchy.countries.find((c) => c.id === parsed.countryId);
  if (!country) return "All areas";

  if (parsed.type === "country") return country.label;

  const region = country.regions.find((r) => r.id === parsed.regionId);
  if (!region) return country.label;

  return `${country.label} › ${region.label}`;
}
