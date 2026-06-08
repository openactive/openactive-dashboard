"use server";

import { apiFetch } from "./api-client";
import type { FeedQualityResponse } from "../types/feed-quality";

/**
 * Server Action: fetch the per-feed quality assessment.
 *
 * Endpoint returns the full set of feeds — there are no filters and no
 * pagination on the API. Cached for 5 minutes.
 */
export async function getFeedQuality(): Promise<FeedQualityResponse> {
  return apiFetch<FeedQualityResponse>("/feed-quality", { revalidate: 300 });
}
