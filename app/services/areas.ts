"use server";

import { apiFetch } from "./api-client";
import type { AreasQuery, AreasResponse } from "../types/areas";

/**
 * Fetch the location hierarchy from the OpenActive Monitor API,
 * optionally narrowed to areas where a given publisher/organization/activity
 * exists. Revalidates every 30 minutes.
 */
export async function getAllAreas(
  query: AreasQuery = {}
): Promise<AreasResponse> {
  const params = new URLSearchParams();

  if (query.publisher?.length) params.set("publisher", query.publisher.join(","));
  if (query.organization?.length) params.set("organization", query.organization.join(","));
  if (query.activity?.length) params.set("activity", query.activity.join(","));

  const path = params.size > 0 ? `/areas?${params.toString()}` : "/areas";
  return apiFetch<AreasResponse>(path, { revalidate: 1800 });
}
