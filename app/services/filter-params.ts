/** Filter values shared by the monitor API list endpoints. */
export type FilterQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
  publisher?: string[];
  organization?: string[];
  activity?: string[];
};

/**
 * Build URL query params from filter values.
 */
export function buildFilterParams(query: FilterQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.district?.length) params.set("district", query.district.join(","));
  if (query.region?.length) params.set("region", query.region.join(","));
  if (query.country?.length) params.set("country", query.country.join(","));
  if (query.publisher?.length) params.set("publisher", query.publisher.join(","));
  if (query.organization?.length) params.set("organization", query.organization.join(","));
  if (query.activity?.length) params.set("activity", query.activity.join(","));

  return params;
}
