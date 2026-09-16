# Monitor API

This app does not store opportunity data itself. It reads the OpenActive Monitor API.

All calls go through `app/services/api-client.ts`. That file:

- reads `OPENACTIVE_API_BASE_URL` and `OPENACTIVE_API_TOKEN`
- puts the token on the URL as `?token=...`
- caches the response with Next `revalidate` (default 300 seconds, which is 5 minutes)

If either env var is missing, the app throws on startup.

## Filters

Most list endpoints share the same query builder: `app/services/filter-param.ts`.

If a filter has values, they are joined with commas, for example `district=E06000001,E06000002`.

Possible keys:

- `district`
- `region`
- `country`
- `publisher`
- `organization`
- `activity`
- `nhs_trust`

If every list is empty, the request has no filter params and the API returns everything.

`/socio` is the exception: this app only sends `district`, `region`, and `country`. It does not send publisher or activity filters there.

## Endpoints we call

| Path | Service file | Cache | Used for |
| --- | --- | --- | --- |
| `/summary` | `ecosystem.ts` | 300s | Landing page numbers |
| `/opportunities` | `opportunities.ts` | 300s | Explorer tools, map, breakdowns |
| `/socio` | `socio.ts` | 1800s (30 min) | population, IMD, Active Lives |
| `/areas` | `areas.ts` | 1800s | Location picker hierarchy |
| `/publishers` | `publishers.ts` | 300s | Publisher filter options |
| `/organizations` | `organizations.ts` | 300s | Provider filter options |
| `/activities` | `activities.ts` | 300s | Activity filter options |
| `/nhs-trusts` | `nhs-trusts.ts` | 300s | NHS trust picker |
| `/feed-quality` | `feed-quality.ts` | 300s | Feed quality table |

Types for each response live in `app/types/`, with matching names (`opportunities.ts`, `socio.ts`, and so on).

`/summary` has no filters. The rest use `buildFilterParams` as above.

## What this is not

`/api/boundaries/local-authority` and `/api/boundaries/nhs` are routes in this Next app. They serve GeoJSON from `app/data/`. They are not Monitor endpoints.