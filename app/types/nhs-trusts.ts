// One NHS Trust from GET /nhs-trusts: its display name and its ODS code.
export interface NHSTrust {
  nhstrust_name: string;
  nhstrust_code: string;
}

export type NHSTrustsResponse = NHSTrust[];

// Cross-filters accepted by GET /nhs-trusts.
export type NHSTrustsQuery = {
  district?: string[];
  region?: string[];
  country?: string[];
  publisher?: string[];
  organization?: string[];
  activity?: string[];
};
