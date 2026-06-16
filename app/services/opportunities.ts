"use server";

import { apiFetch } from "./api-client";
import type {
  OpportunitiesQuery,
  OpportunitiesResponse,
} from "../types/opportunities";

/**
 * Server Action: fetch active opportunities, optionally narrowed by
 * publisher, location codes, and activity/facility label.
 */
export async function getOpportunities(
  query: OpportunitiesQuery = {}
): Promise<OpportunitiesResponse> {
  const params = new URLSearchParams();

  if (query.publisher) params.set("publisher", query.publisher);
  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.activity?.length) params.set("activity", query.activity.join(","));

  const path =
    params.size > 0 ? `/opportunities?${params.toString()}` : "/opportunities";
  return apiFetch<OpportunitiesResponse>(path, { revalidate: 300 });
}
