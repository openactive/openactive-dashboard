import type { FeedQualityRow } from "../../types/feed-quality";

const assessedAt = "2026-01-15T10:00:00.000Z";

function baseFeed(
  overrides: Partial<FeedQualityRow> & Pick<FeedQualityRow, "feed_type" | "dataset_name">
): FeedQualityRow {
  return {
    dataset_url: "https://example.openactive.io",
    feed_url: `https://example.openactive.io/${overrides.feed_type.toLowerCase()}`,
    status: "OK",
    warnings: [],
    errors: [],
    location_completeness: 80,
    start_date_completeness: 75,
    end_date_completeness: 70,
    activities_completeness: 65,
    facilities_completeness: 60,
    age_range_completeness: 55,
    level_completeness: 50,
    accessibility_support_completeness: 45,
    gender_restriction_completeness: 40,
    num_future_opportunity_items: 100,
    feed_version: "1.0",
    last_assessed: assessedAt,
    ...overrides,
  };
}

/** Rows covering status, grouping, and completeness fields used by feed-quality lib. */
export const sampleFeedQualityRows: FeedQualityRow[] = [
  baseFeed({
    dataset_name: "Active Hartlepool",
    feed_type: "ScheduledSession",
    status: "OK",
    location_completeness: 90,
    activities_completeness: 85,
  }),
  baseFeed({
    dataset_name: "Active Hartlepool",
    feed_type: "FacilityUse",
    status: "WARNING",
    warnings: ["Missing end dates"],
    location_completeness: 70,
    facilities_completeness: 72,
  }),
  baseFeed({
    dataset_name: "sessions and facilities",
    dataset_url: "https://lewes-leisure.openactive.io",
    feed_url: "https://lewes-leisure.openactive.io/session",
    feed_type: "ScheduledSession",
    status: "ERROR",
    errors: ["Invalid location"],
    location_completeness: 30,
    activities_completeness: 25,
    num_future_opportunity_items: 0,
  }),
  baseFeed({
    dataset_name: "Highland Active",
    dataset_url: "https://highland-active.openactive.io",
    feed_url: "https://highland-active.openactive.io/slot",
    feed_type: "Slot",
    status: "OK",
    location_completeness: null,
    activities_completeness: null,
    start_date_completeness: null,
    end_date_completeness: null,
    facilities_completeness: null,
    age_range_completeness: null,
    level_completeness: null,
    accessibility_support_completeness: null,
    gender_restriction_completeness: null,
    num_future_opportunity_items: 5,
  }),
];
