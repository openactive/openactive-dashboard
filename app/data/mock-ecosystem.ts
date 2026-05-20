/**
 * Mock data for the Layer 1 ecosystem summary.
 * Shape mirrors the real API response from the OpenActive status endpoint.
 */
export const ecosystemSummary = {
  number_of_opportunities: 10461194,
  number_of_publishers: 173,
  number_of_activities: 856,
  percentage_of_local_authorities: 74,
  number_of_activity_providers: 4885,
} as const;

export type EcosystemSummary = typeof ecosystemSummary;
