/**
 * Single source of truth for the plain-English definitions used across the
 * feed-quality table. Two kinds of term live here:
 *
 *  - `column`  — the table headers (Status, Feed, Quality, Location, ...).
 *  - `feed-type` — the OpenActive opportunity types shown in the body rows
 *    (Slot, FacilityUse, ScheduledSession, ...). These come through the API as
 *    raw PascalCase strings, so {@link lookupFeedType} normalises before lookup.
 *
 * The glossary tooltip reads from this module so the wording only ever has to
 * change in one place.
 */

export type GlossaryCategory = "column" | "feed-type";

export interface GlossaryEntry {
  /** Canonical display label, e.g. "Scheduled session". */
  label: string;
  /** One-line definition shown in the tooltip. */
  definition: string;
  category: GlossaryCategory;
}

/**
 * Column / metric headers. Keyed by the `key` the table already uses for each
 * column so callers can look them up with no extra mapping.
 */
export const COLUMN_GLOSSARY: Record<string, GlossaryEntry> = {
  status: {
    label: "Status",
    definition:
      "Whether the feed is healthy, has warnings, or has errors in OpenActive's latest automated check.",
    category: "column",
  },
  feed: {
    label: "Feed",
    definition:
      "A single published stream of one opportunity type (such as sessions or facility slots) from a publisher.",
    category: "column",
  },
  quality: {
    label: "Completeness",
    definition:
      "The feed's overall score: the average completeness across the fields shown in the current view.",
    category: "column",
  },
  location: {
    label: "Location",
    definition: "% of future items with a geographic location.",
    category: "column",
  },
  activity: {
    label: "Activity / Facility",
    definition: "% of future items naming an activity or facility.",
    category: "column",
  },
  "age-range": {
    label: "Age range",
    definition: "% of future items with an age range.",
    category: "column",
  },
  level: {
    label: "Level",
    definition: "% of future items naming a difficulty level.",
    category: "column",
  },
  accessibility: {
    label: "Accessibility",
    definition: "% of future items naming accessibility support.",
    category: "column",
  },
  gender: {
    label: "Gender restriction",
    definition: "% of future items naming a gender restriction.",
    category: "column",
  },
  items: {
    label: "Future items",
    definition: "Items in this feed scheduled for the future.",
    category: "column",
  },
  updated: {
    label: "Last assessed",
    definition: "When OpenActive last ran a quality check on this feed.",
    category: "column",
  },
};

/**
 * OpenActive opportunity types, keyed by their normalised form (see
 * {@link normaliseFeedTypeKey}). Definitions are grounded in the OpenActive
 * "Types of RPDE feed" reference.
 */
export const FEED_TYPE_GLOSSARY: Record<string, GlossaryEntry> = {
  sessionseries: {
    label: "Session series",
    definition:
      "A repeating set of sessions that share the same activity, location and details, like a weekly yoga class.",
    category: "feed-type",
  },
  scheduledsession: {
    label: "Scheduled session",
    definition:
      "A single dated occurrence of a session series, for example this Tuesday's 7pm yoga class.",
    category: "feed-type",
  },
  eventseries: {
    label: "Event series",
    definition:
      "A group of related events or sessions, used to tie together otherwise-identical listings so they don't appear as duplicates.",
    category: "feed-type",
  },
  event: {
    label: "Event",
    definition:
      "A one-off, ad-hoc event that isn't part of a regular schedule.",
    category: "feed-type",
  },
  headlineevent: {
    label: "Headline event",
    definition:
      "A whole-day or multi-day event, such as a mass-participation race or family fun day, that groups smaller events together.",
    category: "feed-type",
  },
  courseinstance: {
    label: "Course instance",
    definition:
      "A fixed-length course booked as one, made up of several sessions, for example a 6-week beginners' swimming course.",
    category: "feed-type",
  },
  course: {
    label: "Course",
    definition:
      "A course booked as a whole, made up of multiple sessions over a set period.",
    category: "feed-type",
  },
  facilityuse: {
    label: "Facility use",
    definition:
      "A bookable facility for an activity at a venue, for example 'Badminton at Downtown Leisure Centre', reserved in time slots.",
    category: "feed-type",
  },
  individualfacilityuse: {
    label: "Individual facility use",
    definition:
      "A specific sub-facility within a venue, like 'Court 2', the finer-grained version of a facility use.",
    category: "feed-type",
  },
  slot: {
    label: "Slot",
    definition:
      "A bookable block of time on a facility, for example a tennis court free from 9am to 10am.",
    category: "feed-type",
  },
};

// "ScheduledSession", "Scheduled session", "scheduled-session" all -> "scheduledsession".
export function normaliseFeedTypeKey(feedType: string): string {
  return feedType.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Resolve a raw `feed_type` string to its glossary entry. Handles the
 * "IndividualFacilityUseSlot" alias by falling back to its `Slot` meaning.
 */
export function lookupFeedType(feedType: string): GlossaryEntry | undefined {
  const key = normaliseFeedTypeKey(feedType);
  if (FEED_TYPE_GLOSSARY[key]) return FEED_TYPE_GLOSSARY[key];
  // Aliases like "IndividualFacilityUseSlot" end in "slot" but describe a slot.
  if (key.endsWith("slot")) return FEED_TYPE_GLOSSARY.slot;
  return undefined;
}

export function getColumnGlossary(key: string): GlossaryEntry | undefined {
  return COLUMN_GLOSSARY[key];
}
