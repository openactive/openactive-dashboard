interface AreaDistrict {
  district_name: string;
  district_code: string;
}

interface AreaRegion {
  region_code: string;
  districts: AreaDistrict[];
}

/**
 * A country with regions (England) has `regions` as an array of
 * single-key objects keyed by region name.
 *
 * A country without regions (Scotland, Wales, Northern Ireland) has
 * `districts` directly on the country object.
 */
export interface AreaCountryWithRegions {
  country_code: string;
  regions: Array<Record<string, AreaRegion>>;
}

interface AreaCountryWithDistricts {
  country_code: string;
  districts: AreaDistrict[];
}

export type AreaCountry = AreaCountryWithRegions | AreaCountryWithDistricts;

/** Raw response from GET /areas — keyed by country name. */
export type AreasResponse = Record<string, AreaCountry>;

export type AreasQuery = {
  publisher?: string[];
  organization?: string;
  activity?: string[];
};
