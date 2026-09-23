# Glossary

Tooltip wording lives in two modules. The UI does not hard-code definitions next to each label.

## The tip component

`GlossaryTip` in `app/components/feed-quality/GlossaryTip.tsx` is the info icon.

- On devices that can hover (typical desktop mouse), opens on hover or focus; click pins it open
- On touch, opens on click only — so tips do not pop up over modals and filters by accident
- That check is `canHover()` in `app/lib/pointer.ts` (`(hover: hover) and (pointer: fine)`)
- Shows `entry.definition` in a small panel
- Escape closes; the button has an aria-label asking what the term means

`FeedQualityColourKey` uses the same hover vs click rule.

Pass it a `GlossaryEntry`: `{ label, definition, category }`.

## Where the copy lives

### Explorer and area context

`app/lib/explorer-glossary.ts`

- `EXPLORER_GLOSSARY` - filters and summary metrics (Location, Opportunities, Physical Activity, Facilities, Area context, and so on)
- `SOCIO_FIELD_GLOSSARY` - one entry per `/socio` field (population, IMD, Active Lives)
- `OPPORTUNITIES_DEFINITION` - shared sentence for what an opportunity is

Used by the explorer summary, details modal, and area context teaser / section.

### Feed quality

`app/lib/feed-quality-glossary.ts`

- `COLUMN_GLOSSARY` - table column headers (Status, Completeness, Location, Opportunities, ...)
- `FEED_TYPE_GLOSSARY` - OpenActive feed types (Scheduled session, Slot, Facilities, ...)
- `lookupFeedType` - turns API PascalCase names into glossary keys

The Opportunities column reuses `OPPORTUNITIES_DEFINITION` from the explorer file, so that wording only changes in one place.

## how to change a definition

1. Edit the entry in `explorer-glossary.ts` or `feed-quality-glossary.ts`
2. Leave the components alone - they already read from those objects

If you add a new metric or column, add a glossary entry first, then wire `GlossaryTip` next to the label.