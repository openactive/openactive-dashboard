/**
 * One row from GET /opportunities.
 *
 * Each row represents either a publisher's bundle of activities in a
 * district (`is_activity: true`, with `activity_or_facility` typically `"[]"`)
 * or a publisher's offerings for a specific facility type
 * (`is_activity: false`, with `activity_or_facility` as a JSON-encoded
 * string array, e.g. `"[\"Sports Hall\"]"`).
 */
export interface Opportunity {
  district_name: string;
  publisher: string;
  provider: string;
  opportunity_count: number;
  is_activity: boolean;
  /** JSON-encoded string array, e.g. `"[]"` or `"[\"Sports Hall\"]"`. */
  activity_or_facility: string;
  /** JSON-encoded string array of organization names, e.g. `"[\"Active Hartlepool\"]"`. */
  organization_names: string;
  district_code: string;
  region_code: string;
  region_name: string;
  country_code: string;
  country_name: string;
}

export type OpportunitiesResponse = Opportunity[];

export type OpportunitiesQuery = {
  publisher?: string[];
  organization?: string[];
  district?: string[];
  region?: string[];
  country?: string[];
  activity?: string[];
};
