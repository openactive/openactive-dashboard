# Opportunities

This is what we mean by an opportunity, and how the explorer turns API rows into the numbers on the UI.

## The definition we show peopl

The tooltip copy is `OPPORTUNITIES_DEFINITION` in `app/lib/explorer-glossary.ts`.
 
In short: an opportunity is a session, class, event or facility use, that cna be used in the near future (usually within the next 2 to 4 weeks). Each one counts as **one**. We do not count spare spots or extra time slots.

The explorer and feed quality both reuse that same sentence.

## How the explorer adds them up

`useReactiveOpportunities` fetches `GET /opportunities`, then calls `reduceOpportunities` in `app/lib/opportunity-reduce.ts`.

Each row has:

- `opportunity_count` - how many opportunities that row is worth
- `is_activity` - `true` for sessions, classes and events; `false` for facilities

The reducer does:

- `totalOpportunities` += `opportunity_count`
- if `is_activity` is true, also add it to `activityOpportunities`
- if not, add it to `facilityOpportunities`

So:

`totalOpportunities` = `activityOpportunities` + `facilityOpportunities`

This app never multiplies by capacity or spots. It only sums `opportunity_count`. If a row is "one class", that has to come from the API.

The same `opportunity_count` is also added into:

- map colours (`districtCounts`)
- top areas, publishers, providers and activities in the details modal
- opportunities per 1,000 people (that number is `totalOpportunities / population * 1000`)

## Three different API fields

The word "opportunities" is not one field everywhere.

| Place on the site | Field | Where it is fetched |
| --- | --- | --- |
| Landing hero | `number_of_opportunities` | `GET /summary` |
| Explorer, map, modal, per 1,000 | sum of `opportunity_count` | `GET /opportunities` |
| Feed quality column | `num_future_opportunity_items` | `GET /feed-quality` |

Those three should mean the same thing, but they are not calculated in one place in this repo. If a number looks off, check which endpoint it cam from.