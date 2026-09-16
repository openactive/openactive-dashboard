# Explorer map

The map shows opportunity counts by area. It is drawn with D3 in `OpportunityMap.tsx`. The shapes come from this app, not from the Monitor API.

## Where the counts come from

`useReactiveOpportunities` reduces `GET /opportunities` rows. `reduceOpportunities` builds `districtCounts`:

- **LAD mode:** sum `opportunity_count` by `district_name`
- **NHS mode:** sum by `nhstrust_code` (for the map) and also by trust name (for the summary panel)

`DataExplorer` passes `districtCounts` into `OpportunityMap`. Darker areas mean more opportunities. Colours come from `buildColorScale` in `app/lib/map-styles.ts`.

## Where the shapes come from

Boundary GeoJSON is stored under `app/data/` and served by local Next routes:

| Boundary type | File | Route |
| --- | --- | --- |
| Local authority | `app/data/combined-boundaries.geojson` | `GET /api/boundaries/local-authority` |
| NHS trusts | `app/data/nhs-trusts.geojson` | `GET /api/boundaries/nhs` |

Both routes use `serveGeojson` in `app/lib/serve-geojson.ts`. That helper sets `Content-Type: application/geo+json` and caches the response for an hour (`max-age=3600`).

`map-styles.ts` points LAD mode at `/api/boundaries/local-authority`. NHS mode loads `/api/boundaries/nhs` through `loadNhsBasemap` in `nhs-basemap.ts`, which also builds name <-> code maps for the picker and the map to share.

## How a shape joins a count

Each GeoJSON feature has `geo_name` and `geo_code`.

- **LAD:** join on `geo_name` (district name)
- **NHS:** join on `geo_code` (trust code)

If names or codes do not match the opportunities data, that area stays empty on the map even when the API has rows.

## Clicking and scope

Clicking an area calls `onAreaSelect` with a name, optional code, and boundary type. `DataExplorer` turns that into a filter change.

`scopeAreaNames` highlights which areas are in the current selection. `selectedDistrict` is used when exactly one area or trust is chosen. Zoom controls and the legend sit in `MapZoomControls.tsx` and `MapLegend.tsx`.

## What this is not

The map does not call Monitor for geometry. It only uses Monitor for the counts. Changing the boundary files in `app/data/` is how you update the basemap.