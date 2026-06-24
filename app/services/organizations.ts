"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
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
  const params = buildFilterParams(query);

  const path =
    params.size > 0 ? `/organizations?${params.toString()}` : "/organizations";
  return apiFetch<OrganizationsResponse>(path, { revalidate: 300 });
}
