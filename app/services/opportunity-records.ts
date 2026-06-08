"use server";

import { apiFetch } from "./api-client";
import {
  DEFAULT_RECORDS_LIMIT,
  type OpportunityRecordsQuery,
  type OpportunityRecordsResponse,
} from "../types/opportunity-records";

/**
 * Server Action: fetch a page of raw opportunity records, optionally
 * narrowed by publisher, location codes, and activity/facility label.
 *
 * Pagination is offset-based; callers track `has_more` from the response
 * to decide whether to expose a "Load more" affordance.
 */
export async function getOpportunityRecords(
  query: OpportunityRecordsQuery = {}
): Promise<OpportunityRecordsResponse> {
  const params = new URLSearchParams();

  if (query.publisher) params.set("publisher", query.publisher);
  if (query.district) params.set("district", query.district);
  if (query.region) params.set("region", query.region);
  if (query.country) params.set("country", query.country);
  if (query.activity) params.set("activity", query.activity);

  params.set("offset", String(query.offset ?? 0));
  params.set("limit", String(query.limit ?? DEFAULT_RECORDS_LIMIT));

  return apiFetch<OpportunityRecordsResponse>(
    `/opportunity-records?${params.toString()}`,
    { revalidate: 300 }
  );
}
