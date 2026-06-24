"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
import type { ActivitiesQuery, ActivitiesResponse } from "../types/activities";

/**
 * Server Action: fetch activity/facility names filtered by location codes.
 */
export async function getActivities(
  query: ActivitiesQuery = {}
): Promise<ActivitiesResponse> {
  const params = buildFilterParams(query);

  const path = params.size > 0 ? `/activities?${params.toString()}` : "/activities";
  return apiFetch<ActivitiesResponse>(path, { revalidate: 300 });
}
