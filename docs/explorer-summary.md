# Explorer summary UI

The summary shows the same numbers as the map, for the current filters. All of those numbers come from `reduceOpportunities` (see `docs/opportunities.md`).

## Desktop panel

On large screens, `DataExplorer` puts `ExplorerSummary` beside the map with `layout="panel"`.

The panel shows:

- the current selection label (for example "All areas" or a district name)
- total opportunities
- Physical Activity and Facilities split
- counts of areas, publishers, providers, and activities
- a short Area context teaser (population and related lines)
- a **View more details** button when there is at least one opportunity

The teaser is `AreaContextTeaser`. Full socio detail is in the modal (see `docs/socio.md`).

## Details modal

Clicking **View more details** opens `ExplorerDetailsModal`.

Order inside the modal:

1. Opportunity totals and the activity / facility split
2. Counts for the current selection
3. Area context (`AreaContextSection`)
4. Top breakdowns (`TopBreakdownTabs`)
5. A link through to feed quality

Top breakdowns are ranked lists from the summary: top areas, publishers, feeds, providers, and activities. The bar values are opportunity sums. The tab badges are how many distinct items there are.

The modal uses a focus trap and Escape to close so keyboard users stay inside it.

## Mobile

Below the `lg` breakpoint, `ExplorerMobileChrome` takes over.

- A filter button opens a sheet with `ExplorerFilterBar`
- A stats dock shows the headline opportunity count
- Opening stats shows the same `ExplorerSummary` component with `layout="sheet"`

So desktop and mobile share one summary component. Only the chrome around it changes.

## What stays in sync

The panel, the sheet, the modal, and the map all read the same `summary` object from `useReactiveOpportunities`. If the map total and the panel total disagree, the bug is usually in filters or reduce, not in the UI layout.