import type { GlossaryEntry } from "./feed-quality-glossary";

/**
 * Plain-English definitions for the explorer's filters and summary metrics,
 * kept in one place so the wording only changes here.
 */

// One publisher can serve many providers, so the same wording is reused
// wherever the "publisher" concept appears under a slightly different label.
const PUBLISHER_DEFINITION =
  "The software platform or booking system that publishes the data feed. One publisher often lists opportunities for many different providers.";

export const OPPORTUNITIES_DEFINITION =
  "Activities and facilities you can use to get active in the near future, usually within the next 2 to 4 weeks.";

export const EXPLORER_GLOSSARY = {
  area: {
    label: "Location",
    definition:
      "The geographic area used to group opportunities by location, such as a local authority or NHS trust.",
    category: "filter",
  },
  activity: {
    label: "Activity",
    definition:
      "The type of physical activity an opportunity is for, like swimming, yoga or football.",
    category: "filter",
  },
  provider: {
    label: "Activity/Facility Providers",
    definition:
      "The organisation that runs the activity or provides the facility, such as a club, leisure centre or coaching business.",
    category: "filter",
  },
  publisher: {
    label: "Data Publishers",
    definition: PUBLISHER_DEFINITION,
    category: "filter",
  },

  // Metrics shown in the summary panel and the "View the data" details modal.
  opportunities: {
    label: "Opportunities",
    definition: OPPORTUNITIES_DEFINITION,
    category: "metric",
  },
  physicalActivity: {
    label: "Physical Activity",
    definition:
      "Opportunities that are led sessions, classes or events.",
    category: "metric",
  },
  facilities: {
    label: "Facilities",
    definition:
      "Opportunities to hire or use a space or equipment, like a court or pitch.",
    category: "metric",
  },
  feedPublisher: {
    label: "Feed Publishers",
    definition: PUBLISHER_DEFINITION,
    category: "metric",
  },
  feeds: {
    label: "Data",
    definition:
      "A single stream of one opportunity type from a publisher, such as sessions or facility slots.",
    category: "metric",
  },
  activitiesFacilities: {
    label: "Activities & facilities",
    definition:
      "The number of different activities and facilities in the current selection.",
    category: "metric",
  },
} satisfies Record<string, GlossaryEntry>;

export type ExplorerGlossaryKey = keyof typeof EXPLORER_GLOSSARY;
