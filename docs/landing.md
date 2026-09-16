# Landing page

The top of the site is the hero section also known as Layer 1. It lives in `app/components/HeroSection.tsx` and is the first thing that `app/page.tsx` renders.

## What you see

On the left: heading, short copy, and an **Explore the data** link.

On the right: a Lottie animation from `HeroLottie.tsx`. It is an iframe to lottie.host. The wrapper uses `motion-reduce:hidden`, so that people who ask the OS to reduce motion do not see it.

Under that: the five big numbers (`StatsStrip`) and a line that says the numbers update every day.

## Where the numbers come from

`StatsStrip` is a server component. It calls `getEcosystemSummary()` in `app/services/ecosystem.ts`, which hits Monitor `Get /summary` and caches for 300 seconds.

While that fetch runs, `Suspense` shows a skeleton. If the fetch fails, it shows a short error message instead of crashing the page.

The tiles are defined in `STAT_DEFS` in `StatsStrip.tsx`. Each tile is a field from `/summary`, formatted with `formatNumber` from `app/lib/format.ts` (large values become things like `7.9m`).

| Tile on the page | API field                 |
| ---------------- | ------------------------- |
| Opportunities    | `number_of_opportunities` |
| Data publishers  | `number_of_publishers`    |
| Activities       | `number_of_activities`    |
| Facilities       | `number_of_facilities`    |

The TypeScript type is `EcosystemSummaryResponse` in `app/types/ecosystem.ts`. That type also has `number_of_facility_types` and `date`. Those are not shown on the landing tiles.

## What this number is not

The Opportunities tile is whatever `/summary` returns. It is not added up in this app from explorer rows. How we add explorer opportunities is is `docs/opportunities.md`.
