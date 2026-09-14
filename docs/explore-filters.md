# Explorer filters

The explorer keeps one filter object in React state. That object drives the map, the stats panel, and the feed quality table further down the page.

## The filter object

The shape lives in `app/lib/explore-filters.ts` as `ExplorerFilters`.

| Field | Meaning |
| --- | --- |
| `boundaryType` | `"lad"` (local authorities) or `"nhs"` (NHS trusts) |
| `areas` | Selected country / region / district refs. Empty means all areas. Used in LAD mode |
| `nhsTrusts` | Selected trust codes. Empty means all trusts. Used in NHS mode |
| `publisher` | Selected data publishers |
| `organization` | Selected activity / facility providers |
| `activity` | Selected activity or facility names |

Defaults are `DEFAULT_EXPLORER_FILTERS`: LAD mode, everything empty (unfiltered).

`DataExplorer.tsx` owns the state with `useState` and updates it when someone uses the filter bar or clicks the map.

## Turning UI selection into API params

UI area refs are not the same as Monitor codes. `buildLocationFilterQuery` in `app/lib/explorer-location-query.ts` does that mapping.

- **LAD mode:** turns `areas` into `district`, `region`, and/or `country` code arrays
- **NHS mode:** ignores `areas` and sends `nhs_trust`. If no trusts are selected, it sends `nhs_trust=all` so the API still returns NHS-scoped results

`buildFeedQualityQuery` takes that location query and adds publisher, organization, and activity when they are set.

Those arrays become comma-joined query params in `buildFilterParams` (see `docs/monitor-api.md`).

## How filters reach each part of the page

1. **Opportunities / map / summary** — `useReactiveOpportunities` builds a query from the current filters and calls `GET /opportunities`
2. **Publisher / provider / activity dropdowns** — `useLocationScopedFilterOptions` loads options for the current location (and the other active filters), so the lists stay in step with the map
3. **Feed quality** — `DataExplorer` calls `buildFeedQualityQuery`, then `usePublishFeedQualityFilters` to push that query into `FeedQualityFilterProvider`

`FeedQualityFilterProvider` is a small context bus. The explorer writes; the feed quality section reads. Feed quality does not need to know about picker internals.

## Stale selections

After opportunities load, `DataExplorer` can drop publisher, provider, or activity values that are no longer present in the result. That stops the UI holding filters that would return nothing.

## Related files

- Filter bar UI: `ExplorerFilterBar.tsx` and `app/components/area-hierarchy-picker/`
- Area ref helpers: `app/lib/area-selection.ts`