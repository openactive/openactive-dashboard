"use server";

import { apiFetch } from "./api-client";
import { buildFilterParams } from "./filter-params";
import type { SocioQuery, SocioResponse } from "../types/socio";

/**
 * Server Action: fetch socio-economic context per area (population, IMD,
 * Active Lives). With no filters, every area is returned. District, region,
 * and country codes are matched against `area_code` (OR).
 */
export async function getSocioContext(
  query: SocioQuery = {}
): Promise<SocioResponse> {
  const params = buildFilterParams(query);

  const path = params.size > 0 ? `/socio?${params.toString()}` : "/socio";
  return apiFetch<SocioResponse>(path, { revalidate: 1800 });
}
