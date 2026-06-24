"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
import type { PublishersQuery, PublishersResponse } from "../types/publishers";

/**
 * Server Action: fetch publisher names filtered by location codes.
 */
export async function getPublishers(
  query: PublishersQuery = {}
): Promise<PublishersResponse> {
  const params = buildFilterParams(query);

  const path = params.size > 0 ? `/publishers?${params.toString()}` : "/publishers";
  return apiFetch<PublishersResponse>(path, { revalidate: 300 });
}
