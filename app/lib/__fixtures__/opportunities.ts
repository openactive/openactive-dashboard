import type { Opportunity } from "../../types/opportunities";

const baseRow = {
  region_code: "",
  region_name: "",
  country_code: "",
  country_name: "",
  nhstrust_name: "",
  nhstrust_code: "",
} satisfies Partial<Opportunity>;

/** Sample /opportunities rows for LAD-mode reduce and query tests. */
export const sampleLadOpportunities: Opportunity[] = [
  {
    ...baseRow,
    district_name: "Hartlepool",
    district_code: "E06000001",
    region_code: "E12000001",
    region_name: "North East",
    country_code: "E92000001",
    country_name: "England",
    publisher: "Active Hartlepool",
    provider: "active-hartlepool",
    opportunity_count: 42,
    is_activity: true,
    activity_or_facility: "[]",
    organization_names: '["Active Hartlepool"]',
  },
  {
    ...baseRow,
    district_name: "Lewes District",
    district_code: "E06000059",
    region_code: "E12000008",
    region_name: "South East",
    country_code: "E92000001",
    country_name: "England",
    publisher: "Lewes Leisure",
    provider: "lewes-leisure",
    opportunity_count: 18,
    is_activity: false,
    activity_or_facility: '["Sports Hall"]',
    organization_names: '["Lewes Leisure Trust"]',
  },
  {
    ...baseRow,
    district_name: "Highland",
    district_code: "S12000017",
    region_code: "S92000003",
    region_name: "Scotland",
    country_code: "S92000003",
    country_name: "Scotland",
    publisher: "Highland Active",
    provider: "highland-active",
    opportunity_count: 7,
    is_activity: true,
    activity_or_facility: "[]",
    organization_names: "[]",
  },
];

/** Sample /opportunities rows for NHS-mode reduce tests (join by trust code). */
export const sampleNhsOpportunities: Opportunity[] = [
  {
    ...baseRow,
    district_name: "",
    district_code: "",
    publisher: "NHS Example",
    provider: "nhs-example",
    opportunity_count: 25,
    is_activity: true,
    activity_or_facility: "[]",
    organization_names: '["NHS Provider"]',
    nhstrust_name: "Manchester University NHS Foundation Trust",
    nhstrust_code: "R0A",
  },
  {
    ...baseRow,
    district_name: "",
    district_code: "",
    publisher: "NHS Example",
    provider: "nhs-example-2",
    opportunity_count: 10,
    is_activity: false,
    activity_or_facility: '["Gym"]',
    organization_names: "[]",
    nhstrust_name: "Barts Health NHS Trust",
    nhstrust_code: "R1H",
  },
];

export const sampleOpportunities: Opportunity[] = [
  ...sampleLadOpportunities,
  ...sampleNhsOpportunities,
];
