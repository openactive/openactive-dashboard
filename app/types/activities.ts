export type ActivitiesResponse = string[];

export type ActivitiesQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
  publisher?: string[];
  organization?: string[];
  nhs_trust?: string[];
};
