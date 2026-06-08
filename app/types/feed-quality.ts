/** Types for GET /feed-quality. */

// Real array — use it to render lists.
export const FEED_STATUSES = ["OK", "WARNING", "ERROR"] as const;

// Type only — stops typos in code that touches status.
export type FeedStatus = (typeof FEED_STATUSES)[number];

export interface FeedQualityRow {
  dataset_name: string;
  dataset_url: string;
  feed_type: string;
  feed_url: string;
  status: FeedStatus;
  warnings: string[];
  errors: string[];
  location_completeness: number | null;
  start_date_completeness: number | null;
  end_date_completeness: number | null;
  activities_completeness: number | null;
  facilities_completeness: number | null;
  num_future_opportunity_items: number;
  feed_version: string;
  last_assessed: string;
}

export type FeedQualityResponse = FeedQualityRow[];
