# Socio context

Area context is population, deprivation (IMD), and Active Lives data for the current location. it sits in the explorer summary teaser and in the details modal. It is not on the landing page.

## Fetch

`useSocioContext` calls `getSocioContext` -> `GET /socio`.

- Only location filters are sent: `district`, `region`, `country`
- Cached for 1800 seconds (30 minutes) on the server
- The hook also caches rows per location query in memory
- When only the opportunity total changes, it recomputes per 1,000 without refetching `/socio`

## NHS mode

Socio data is keyed by ONS geography codes, not NHS trusts. If `boundaryType` is `"nhs"`, the hook does not fetch. The modal tells the user to switch to local authority boundaries.

## How we decide what to show

`resolveSocioContext` in `app/lib/socio-context.ts` turns API rows into a view model.

**Single England LAD** (one row that has IMD and/or Active Lives fields):

- show that row's `total_population`
- show IMD and Active lives for that row
- keep `ladRow` so the UI can read the detailed fields

**Anything else** (many areas, a region, Scotland / Wales / NI, or an aggregate row):

- `totalPopulation` = sum of every `total_population` (nulls skipped)
- do **not** show IMD or Active Lives (we never average those across areas)
- may show an England-only note when some rows have no IMD/ALS

**No rows:** empty context.

## Population and per 1,000

Population is just the sum (or the single-row value). Display uses `formatNumber`, so large totals look like `439.3m`.

Per 1,000 people is:

```
(totalOpportunities / totalPopulation) * 1000
```

`totalOpportunities` comes from the explorer opportunities summary, not from `/socio`. If population is missing or zero, per 1,000 is hidden.

## Where it appears

| UI | Component | What it shows |
| --- | --- | --- |
| Summary panel / mobile sheet | `AreaContextTeaser` | Population, optional active rate (single England LAD), per 1,000 |
| Details modal | `AreaContextSection` | Full population block, IMD, Active Lives, tooltips |

Rate-change fields (for example active rate change over 12 months) are shown as percentage points (`pp`). There is a glossary tip for that unit.

## Field reference

The TypeScript shape is `SocioAreaRow` in `app/types/socio.ts`:

- `total_population` - all areas
- `imd25_*` - England LAD only
- `als_*` - England LAD only