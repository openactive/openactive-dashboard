/**
 * One row from GET /opportunity-records — a single opportunity from the
 * raw `opportunities` table. Unlike /opportunities (cross-tab summary),
 * each item here is a real publisher record with full json_data.
 */
export interface OpportunityRecord {
  publisher_name: string;
  feed_id: string;
  /** Stable record id within the feed; combine with feed_id for uniqueness. */
  id: string;
  /** OpenActive @type, e.g. SessionSeries, CourseInstance, Slot. */
  kind: string;
  start_date: string | null;
  end_date: string | null;
  last_updated: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  district_name: string | null;
  district_code: string | null;
  region_name: string | null;
  region_code: string | null;
  country_name: string | null;
  country_code: string | null;
  /** Activity prefLabels extracted from the source JSON. */
  activity: string[];
  /** Facility-type prefLabels extracted from the source JSON. */
  facility: string[];
  /** Full publisher payload, shape varies by feed/version. */
  json_data: Record<string, unknown>;
}

export interface OpportunityRecordsResponse {
  items: OpportunityRecord[];
  offset: number;
  limit: number;
  has_more: boolean;
  /** Optional total — not always returned by the API. */
  total?: number;
}

export type OpportunityRecordsQuery = {
  publisher?: string;
  district?: string;
  region?: string;
  country?: string;
  activity?: string;
  offset?: number;
  limit?: number;
};
