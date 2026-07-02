export type PublishersResponse = string[];

export type PublishersQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
  organization?: string[];
  activity?: string[];
  nhs_trust?: string[];
};
