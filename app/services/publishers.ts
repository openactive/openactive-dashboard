"use server";

import { apiFetch } from "./api-client";
import type { PublishersQuery, PublishersResponse } from "../types/publishers";

/**
 * Server Action: fetch publisher names filtered by location codes.
 * Called directly from client components — no proxy route needed.
 */
export async function getPublishers(
  query: PublishersQuery = {}
): Promise<PublishersResponse> {
  const params = new URLSearchParams();

  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.activity) params.set("activity", query.activity);

  const path = params.size > 0 ? `/publishers?${params.toString()}` : "/publishers";
  return apiFetch<PublishersResponse>(path, { revalidate: 300 });
}
