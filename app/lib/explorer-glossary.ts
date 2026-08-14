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

  // Area context — population, deprivation (IMD), and Active Lives (England LAD only).
  areaContext: {
    label: "Area context",
    definition:
      "Socio-economic background for the selected geography. Deprivation and activity levels are available for English local authorities only.",
    category: "metric",
  },
  population: {
    label: "Population",
    definition: "The number of people living in this area.",
    category: "metric",
  },
  opportunitiesPer1000: {
    label: "Opportunities per 1,000 people",
    definition:
      "OpenActive opportunities divided by population, scaled per thousand people. Slot-based feeds can make this figure much higher than traditional sessions or classes would suggest.",
    category: "metric",
  },
  imdDeprivation: {
    label: "Deprivation (IMD)",
    definition:
      "Indices of Multiple Deprivation for England. Around 32,000 small neighbourhoods are ranked; those scores are averaged at local authority level. Lower rank means more deprived.",
    category: "metric",
  },
  activeLives: {
    label: "Active Lives",
    definition:
      "Sport England's Active Lives Survey — an annual survey of who is active in England. Rates show the share of adults who are active, fairly active, or inactive.",
    category: "metric",
  },
  areaContextEnglandOnly: {
    label: "England only",
    definition:
      "Deprivation and Active Lives data are only available for English local authorities. Population is shown for all areas.",
    category: "metric",
  },
} satisfies Record<string, GlossaryEntry>;

/** Glossary entries keyed by /socio response field names (and derived metrics). */
export const SOCIO_FIELD_GLOSSARY = {
  total_population: EXPLORER_GLOSSARY.population,
  opportunities_per_1000: EXPLORER_GLOSSARY.opportunitiesPer1000,
  imd25_average_score: {
    label: "Average deprivation score",
    definition:
      "The average deprivation score across neighbourhoods in this local authority, based on the Indices of Multiple Deprivation.",
    category: "metric",
  },
  imd25_rank_of_average_score: {
    label: "Deprivation rank",
    definition:
      "Where this local authority ranks among all English local authorities, from most deprived (1) to least deprived. Based on the average neighbourhood score.",
    category: "metric",
  },
  imd25_pct_lsoas_in_most_deprived_10pct: {
    label: "Neighbourhoods in most deprived 10%",
    definition:
      "The share of neighbourhoods in this local authority that fall within England's most deprived 10% of areas.",
    category: "metric",
  },
  imd25_extent: {
    label: "Deprivation extent",
    definition:
      "How widely deprivation is spread across the local authority — the proportion of neighbourhoods that are deprived.",
    category: "metric",
  },
  imd25_local_concentration: {
    label: "Deprivation concentration",
    definition:
      "How concentrated the most deprived neighbourhoods are within this local authority.",
    category: "metric",
  },
  als_respondents: {
    label: "Survey respondents",
    definition:
      "The number of people who took part in the Active Lives Survey sample for this area.",
    category: "metric",
  },
  als_survey_adult_population: {
    label: "Adult population surveyed",
    definition:
      "The adult population the Active Lives Survey results apply to in this area.",
    category: "metric",
  },
  als_active_pop: {
    label: "Active adults",
    definition:
      "Estimated number of adults doing at least 150 minutes of moderate activity per week.",
    category: "metric",
  },
  als_fairly_active_pop: {
    label: "Fairly active adults",
    definition:
      "Estimated number of adults doing 30–149 minutes of moderate activity per week.",
    category: "metric",
  },
  als_inactive_pop: {
    label: "Inactive adults",
    definition:
      "Estimated number of adults doing less than 30 minutes of moderate activity per week.",
    category: "metric",
  },
  als_active_rate: {
    label: "Active rate",
    definition:
      "The percentage of adults who are active — doing at least 150 minutes of moderate activity per week.",
    category: "metric",
  },
  als_fairly_active_rate: {
    label: "Fairly active rate",
    definition:
      "The percentage of adults who are fairly active — doing 30–149 minutes of moderate activity per week.",
    category: "metric",
  },
  als_inactive_rate: {
    label: "Inactive rate",
    definition:
      "The percentage of adults who are inactive — doing less than 30 minutes of moderate activity per week.",
    category: "metric",
  },
  als_active_rate_change_12m: {
    label: "Active rate change (12 months)",
    definition:
      "How much the active rate has changed compared with 12 months ago, in percentage points.",
    category: "metric",
  },
  als_inactive_rate_change_12m: {
    label: "Inactive rate change (12 months)",
    definition:
      "How much the inactive rate has changed compared with 12 months ago, in percentage points.",
    category: "metric",
  },
} satisfies Record<string, GlossaryEntry>;

export type ExplorerGlossaryKey = keyof typeof EXPLORER_GLOSSARY;
