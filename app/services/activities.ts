"use server";

import { apiFetch } from "./api-client";
import type { ActivitiesQuery, ActivitiesResponse } from "../types/activities";

/**
 * Server Action: fetch activity/facility names filtered by location codes.
 */
export async function getActivities(
  query: ActivitiesQuery = {}
): Promise<ActivitiesResponse> {
  const params = new URLSearchParams();

  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.publisher?.length) params.set("publisher", query.publisher.join(","));
  if (query.organization) params.set("organization", query.organization);

  const path = params.size > 0 ? `/activities?${params.toString()}` : "/activities";
  return apiFetch<ActivitiesResponse>(path, { revalidate: 300 });
}
