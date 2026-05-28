import { apiFetch } from "./api-client";
import type { EcosystemSummaryResponse } from "../types/ecosystem";

/**
 * Fetch the live ecosystem summary from the OpenActive Monitor API.
 * Revalidates every 5 minutes (server-side cache).
 */
export async function getEcosystemSummary(): Promise<EcosystemSummaryResponse> {
  const data = await apiFetch<EcosystemSummaryResponse>("/summary", {
    revalidate: 300,
  });

  return data;
}
