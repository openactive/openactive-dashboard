# Architecture

This app is a Next.js site. Almost everything lives under `app/`.

## The page

`app/layout.tsx` wraps every page with the header, footer, and React Query (`app/providers.tsx`).

The home page is `app/page.tsx`. Top to bottom it renders"

1.**Hero** - summarized numbers for the whole ecosystem (`HeroSection`)
2.**Explorer** - map, filters, and stats (`DataExplorerSection`)
3.**Feed quality** - how reliable the matching feeds are (`FeedQualitySection`)

Explorer and feed quality share a wrapper, `FeedQualityFilterProvider`. When you change the explorer search, feed quality uses the same filters.

## How the folders split the work

Data moves in one direction:

`types` -> `services` -> `hooks` -> `components`

- `app/types/` - shapes of Monitor API responses
- `app/services/` - server functions that fetch those APIs. They all go through `api-client.ts`, which adds the token and base URL
- `app/lib/` - plain logic (adding up opportunities, filters, glossary)
- `app/hooks/` - client logic: fetch, cache, turn API rows into what the UI needs
- `app/components/` - the UI screens

Two other folders:
- `app/api/boundaries/` - local routes that serve map GeoJSON
- `app/data/` - the GeoJSON files themselves

## Server vs client

Services run on the server (`"use server` on some of them). They must not leak the API token to the browser.

The explorer, map, and feed quality table are client components. They call those server funtions from the hooks.

## Caching

There are a few layers:

- Next `fetch` `revalidate` in `apiFetch` (default 300 seconds)
- React Query in `providers.tsx` (data stays fresh for 60 seconds, no refetch on tab focus)
- Some hooks keep their own cache (opportunities and socio) so changing a filter does not always hit the API again

Map boundaries are static files with HTTP cache headers from `serve-geojson.ts`.

## What lives where (short)

| If you need... | Look in... |
| --- | --- |
| Opportunity totals and map counts | `app/lib/opportunity-reduce.ts` |
| Filter state | `app/lib/explore-filters.ts` |
| Population / IMD / Active Lives | `app/lib/socio-context.ts` |
| Feed quality grouping | `app/lib/feed-quality.ts` |
| Tooltip Copy | `app/lib/ezplorer-glossary.ts` |

That last bit is a table. In Markdown:

| column A | column B |
| --- | --- |
| cell | cell |

The | --- | --- | row turns the first row into headers.
