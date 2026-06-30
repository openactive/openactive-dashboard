/**
 * Response from GET /nhs-trusts — a list of distinct NHS Trust names,
 * e.g. ["Airedale NHS Foundation Trust", "Barts Health NHS Trust", ...].
 *
 */
export type NHSTrustsResponse = string[];

/**
 * Cross-filters accepted by GET /nhs-trusts
 */
export type NHSTrustsQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
  publisher?: string[];
  organization?: string[];
  activity?: string[];
};
