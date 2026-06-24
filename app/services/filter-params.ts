/** Filter values shared by the monitor API list endpoints. */
export type FilterQuery = {
  district?: string;
  region?: string;
  country?: string;
  publisher?: string[];
  organization?: string[];
  activity?: string[];
};

/**
 * Build URL query params from filter values.
 */
export function buildFilterParams(query: FilterQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.publisher?.length) params.set("publisher", query.publisher.join(","));
  if (query.organization?.length) params.set("organization", query.organization.join(","));
  if (query.activity?.length) params.set("activity", query.activity.join(","));

  return params;
}
