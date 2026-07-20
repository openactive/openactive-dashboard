/**
 * One area row from GET /socio, keyed by ONS geography code (`area_code`).
 * Matches district_code / region_code / country_code used elsewhere.
 *
 * `total_population` is available for all areas. IMD (`imd25_*`) and Active
 * Lives (`als_*`) metrics are England local-authority only and are null for
 * other areas and for region/country aggregate rows.
 */
export interface SocioAreaRow {
  area_code: string;
  area_name: string;
  total_population: number | null;

  imd25_average_score: number | null;
  imd25_rank_of_average_score: number | null;
  imd25_pct_lsoas_in_most_deprived_10pct: number | null;
  imd25_extent: number | null;
  imd25_local_concentration: number | null;

  als_respondents: number | null;
  als_active_pop: number | null;
  als_fairly_active_pop: number | null;
  als_inactive_pop: number | null;
  als_survey_adult_population: number | null;
  als_active_rate: number | null;
  als_fairly_active_rate: number | null;
  als_inactive_rate: number | null;
  als_active_rate_change_12m: number | null;
  als_inactive_rate_change_12m: number | null;
}

/** Raw response from GET /socio — one row per matching area. */
export type SocioResponse = SocioAreaRow[];

/**
 * Location filters for /socio. Values are matched against `area_code`
 * (combined with OR). Unlike opportunities, publisher/activity filters
 * are not supported on this endpoint.
 */
export type SocioQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
};
