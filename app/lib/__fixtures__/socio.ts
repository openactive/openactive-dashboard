import type { SocioAreaRow } from "../../types/socio";

/** Hartlepool — England LAD with full IMD + ALS data. */
export const hartlepoolSocioRow: SocioAreaRow = {
  area_code: "E06000001",
  area_name: "Hartlepool",
  total_population: 98180,
  imd25_average_score: 37.58,
  imd25_rank_of_average_score: 6,
  imd25_pct_lsoas_in_most_deprived_10pct: 0.4211,
  imd25_extent: 0.5259,
  imd25_local_concentration: 33623.27,
  als_respondents: 879,
  als_active_pop: 46000,
  als_fairly_active_pop: 6900,
  als_inactive_pop: 26700,
  als_survey_adult_population: 79600,
  als_active_rate: 0.5782,
  als_fairly_active_rate: 0.0871,
  als_inactive_rate: 0.3348,
  als_active_rate_change_12m: 0.0116,
  als_inactive_rate_change_12m: 0.0057,
};

/** Highland — Scotland LAD; population only. */
export const highlandSocioRow: SocioAreaRow = {
  area_code: "S12000017",
  area_name: "Highland",
  total_population: 237290,
  imd25_average_score: null,
  imd25_rank_of_average_score: null,
  imd25_pct_lsoas_in_most_deprived_10pct: null,
  imd25_extent: null,
  imd25_local_concentration: null,
  als_respondents: null,
  als_active_pop: null,
  als_fairly_active_pop: null,
  als_inactive_pop: null,
  als_survey_adult_population: null,
  als_active_rate: null,
  als_fairly_active_rate: null,
  als_inactive_rate: null,
  als_active_rate_change_12m: null,
  als_inactive_rate_change_12m: null,
};
