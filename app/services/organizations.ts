"use server";

import { apiFetch } from "./api-client";
import type {
  OrganizationsQuery,
  OrganizationsResponse,
} from "../types/organizations";

/**
 * Server Action: fetches organization(Activity/Facility Providers) names.
 */
export async function getOrganizations(
  query: OrganizationsQuery = {}
): Promise<OrganizationsResponse> {
  const params = new URLSearchParams();

  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.publisher) params.set("publisher", query.publisher);
  if (query.activity?.length) params.set("activity", query.activity.join(","));

  const path =
    params.size > 0 ? `/organizations?${params.toString()}` : "/organizations";
  return apiFetch<OrganizationsResponse>(path, { revalidate: 300 });
}
