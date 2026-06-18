/** Types for GET /feed-quality. */

export const FEED_STATUSES = ["OK", "WARNING", "ERROR"] as const;

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
  age_range_completeness: number | null;
  level_completeness: number | null;
  accessibility_support_completeness: number | null;
  gender_restriction_completeness: number | null;
  num_future_opportunity_items: number;
  feed_version: string;
  last_assessed: string;
}

export type FeedQualityResponse = FeedQualityRow[];
