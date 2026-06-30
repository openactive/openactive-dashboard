"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
import type { NHSTrustsQuery, NHSTrustsResponse } from "../types/nhs-trusts";

/**
 * Server Action: fetch the list of distinct NHS Trust names, optionally
 * narrowed by location codes, publisher, organization, or activity.
 * Revalidates every 30 minutes.
 */
export async function getAllNHSTrusts(
  query: NHSTrustsQuery = {}
): Promise<NHSTrustsResponse> {
  const params = buildFilterParams(query);

  const path =
    params.size > 0 ? `/nhs-trusts?${params.toString()}` : "/nhs-trusts";
  return apiFetch<NHSTrustsResponse>(path, { revalidate: 1800 });
}
