import { apiFetch } from "./api-client";
import type { AreasResponse } from "../types/areas";

/**
 * Fetch the full location hierarchy from the OpenActive Monitor API.
 * Revalidates every 30 minutes (data changes infrequently).
 */
export async function getAllAreas(): Promise<AreasResponse> {
  return apiFetch<AreasResponse>("/areas", { revalidate: 1800 });
}
