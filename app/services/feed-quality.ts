"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams, type FilterQuery } from "./filter-params";
import type { FeedQualityResponse } from "../types/feed-quality";

/**
 * Server Action: fetch the per-feed quality assessment.
 *
 * With no query it returns every feed. Supplying filters narrows it to the
 * feeds published by the publishers matching those filters (the API resolves
 * matching publishers first, then restricts feed_quality to their feeds).
 * Cached for 5 minutes per filter combination.
 */
export async function getFeedQuality(
  query: FilterQuery = {}
): Promise<FeedQualityResponse> {
  const params = buildFilterParams(query);

  const path =
    params.size > 0 ? `/feed-quality?${params.toString()}` : "/feed-quality";
  return apiFetch<FeedQualityResponse>(path, { revalidate: 300 });
}
