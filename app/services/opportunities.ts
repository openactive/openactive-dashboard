"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
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
  const params = buildFilterParams(query);

  const path =
    params.size > 0 ? `/opportunities?${params.toString()}` : "/opportunities";
  return apiFetch<OpportunitiesResponse>(path, { revalidate: 300 });
}
