# Feed quality

The Data quality section shows how complete each OpenActive feed is. It sits below the explorer on the same page (`id="feed-quality"`).

## How it follows the explorer

`FeedQualityFilterProvider` wraps both sections in `app/page.tsx`.

1. The explorer builds a query with `buildFeedQualityQuery`
2. It publishes the query with `usePublishFeedQualityFilters`
3. Feed quality reads it with `useFeedQualityFilters`

So when you filter the map, the quality table uses the same search. Feed quality does not own its own location picker.

## Lazy load

`FeedQualtySection` does not fetch until the section is near the viewport. An `IntersectionObserver` sets `enabled` to true, then `useFeedQuality` runs. That keeps the first paint lighter.

## Fetch and cache

`useFeedQuality` calls `getFeedQuality` -> `GET /feed-quality` (300 second server cache).

Rows are also cached in the hook per filter combination. Going back to a previous search reuses the cache and skips the loading skeleton.

If the API fails, the failed key is dropped so Retry can try again.

## Grouping and views

`groupFeedsByDataset` in `app/lib/feed-quality.ts` groups rows by dataset.

The UI has two views (`FeedQualityViewToggle`):

- **Data completeness** - core fields used for headline opportunity figures (dates, location, activity or facility)
- **Content quality** - extra fields that help people see/choose (age range, level, accessibility, gender restriction)

Completeness bands (high / moderate / low / none / not assessed) are defined in `COMPLETENESS_BANDS` in the same file. Colour cells use those bands.

Each feeds also has a status: `OK`, `WARNING`, or `ERROR` (shown as Healthy / Warning / Error).

## Opportunities column

The table column labelled Opportunities uses `num_future_opportunity_items`. That is a different field from explorer `opportunity_count` (see `docs/opportunities.md`).

## Main UI pieces

| Piece | Role |
| --- | --- |
| `FeedQualitySummary` | Counts and overview |
| `FeedQualityTable` | Desktop table |
| Dataset / feed cards | Narrower layouts |
| `GlossaryTip` | Column and feed-type definitions |
| `FeedQualityColourKey` | Explains the colour bands |