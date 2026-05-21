/**
 * Mock data for the Layer 2 Interactive Data Explorer.
 * Shapes mirror the future cross-tab / aggregation API response.
 */

export interface Region {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
  /** Baseline opportunity count (unfiltered corpus) */
  opportunities: number;
}

export interface Publisher {
  id: string;
  name: string;
  regionId: string;
  opportunities: number;
  activityIds: string[];
  /** Local authority ONS codes this publisher contributes to */
  localAuthorityIds: string[];
  lastUpdated: string;
}

export interface LocalAuthority {
  /** ONS / GSS code — must match map GeoJSON properties */
  id: string;
  name: string;
  regionId: string;
  opportunities: number;
}

export const regions: Region[] = [
  { id: "east-midlands", name: "East Midlands" },
  { id: "east-of-england", name: "East of England" },
  { id: "london", name: "London" },
  { id: "north-east", name: "North East" },
  { id: "north-west", name: "North West" },
  { id: "south-east", name: "South East" },
  { id: "south-west", name: "South West" },
  { id: "west-midlands", name: "West Midlands" },
  { id: "yorkshire", name: "Yorkshire and the Humber" },
  { id: "scotland", name: "Scotland" },
  { id: "wales", name: "Wales" },
  { id: "northern-ireland", name: "Northern Ireland" },
];

export const activities: Activity[] = [
  { id: "football", name: "Football", opportunities: 1_245_000 },
  { id: "swimming", name: "Swimming", opportunities: 987_000 },
  { id: "running", name: "Running", opportunities: 876_000 },
  { id: "yoga", name: "Yoga", opportunities: 756_000 },
  { id: "cycling", name: "Cycling", opportunities: 654_000 },
  { id: "tennis", name: "Tennis", opportunities: 543_000 },
  { id: "gym", name: "Gym & Fitness", opportunities: 1_100_000 },
  { id: "dance", name: "Dance", opportunities: 432_000 },
  { id: "pilates", name: "Pilates", opportunities: 321_000 },
  { id: "basketball", name: "Basketball", opportunities: 289_000 },
  { id: "cricket", name: "Cricket", opportunities: 267_000 },
  { id: "badminton", name: "Badminton", opportunities: 234_000 },
  { id: "hiking", name: "Hiking & Walking", opportunities: 456_000 },
  { id: "martial-arts", name: "Martial Arts", opportunities: 198_000 },
  { id: "rowing", name: "Rowing", opportunities: 145_000 },
  { id: "netball", name: "Netball", opportunities: 132_000 },
  { id: "rugby", name: "Rugby", opportunities: 128_000 },
  { id: "golf", name: "Golf", opportunities: 118_000 },
  { id: "squash", name: "Squash", opportunities: 95_000 },
  { id: "table-tennis", name: "Table Tennis", opportunities: 87_000 },
];

export const publishers: Publisher[] = [
  {
    id: "everyone-active",
    name: "Everyone Active",
    regionId: "london",
    opportunities: 1_234_567,
    activityIds: ["swimming", "gym", "tennis"],
    localAuthorityIds: ["E09000001", "E09000007", "E09000022", "E09000028", "E09000033"],
    lastUpdated: "2026-05-21T08:30:00Z",
  },
  {
    id: "gll-better",
    name: "GLL (Better)",
    regionId: "london",
    opportunities: 987_654,
    activityIds: ["swimming", "gym", "football"],
    localAuthorityIds: ["E09000003", "E09000012", "E09000013", "E09000019", "E09000032"],
    lastUpdated: "2026-05-21T07:15:00Z",
  },
  {
    id: "places-leisure",
    name: "Places Leisure",
    regionId: "south-east",
    opportunities: 876_543,
    activityIds: ["swimming", "gym", "yoga"],
    localAuthorityIds: ["E06000043", "E10000016", "E10000030", "E10000032"],
    lastUpdated: "2026-05-20T23:45:00Z",
  },
  {
    id: "parkwood",
    name: "Parkwood Leisure",
    regionId: "south-west",
    opportunities: 654_321,
    activityIds: ["swimming", "tennis", "cycling"],
    localAuthorityIds: ["E06000022", "E06000023", "E10000008", "E10000027"],
    lastUpdated: "2026-05-21T06:00:00Z",
  },
  {
    id: "freedom-leisure",
    name: "Freedom Leisure",
    regionId: "south-east",
    opportunities: 543_210,
    activityIds: ["gym", "swimming", "dance"],
    localAuthorityIds: ["E06000044", "E06000045", "E10000011", "E10000014"],
    lastUpdated: "2026-05-21T05:30:00Z",
  },
  {
    id: "fusion-lifestyle",
    name: "Fusion Lifestyle",
    regionId: "east-of-england",
    opportunities: 432_109,
    activityIds: ["gym", "swimming", "yoga"],
    localAuthorityIds: ["E06000031", "E10000003", "E10000012", "E10000020"],
    lastUpdated: "2026-05-20T22:00:00Z",
  },
  {
    id: "active-norfolk",
    name: "Active Norfolk",
    regionId: "east-of-england",
    opportunities: 321_098,
    activityIds: ["football", "running", "cycling"],
    localAuthorityIds: ["E10000020", "E06000031", "E10000003"],
    lastUpdated: "2026-05-21T04:00:00Z",
  },
  {
    id: "sheffield-trust",
    name: "Sheffield City Trust",
    regionId: "yorkshire",
    opportunities: 234_567,
    activityIds: ["swimming", "gym", "basketball"],
    localAuthorityIds: ["E08000019", "E08000016", "E08000017"],
    lastUpdated: "2026-05-21T03:00:00Z",
  },
  {
    id: "edinburgh-leisure",
    name: "Edinburgh Leisure",
    regionId: "scotland",
    opportunities: 198_765,
    activityIds: ["swimming", "gym", "yoga"],
    localAuthorityIds: ["S12000036", "S12000041", "S12000039"],
    lastUpdated: "2026-05-20T21:00:00Z",
  },
  {
    id: "cardiff-council",
    name: "Cardiff Council",
    regionId: "wales",
    opportunities: 167_890,
    activityIds: ["football", "swimming", "running"],
    localAuthorityIds: ["W06000015", "W06000011", "W06000012"],
    lastUpdated: "2026-05-21T02:30:00Z",
  },
  {
    id: "active-derbyshire",
    name: "Active Derbyshire",
    regionId: "east-midlands",
    opportunities: 289_012,
    activityIds: ["running", "cycling", "hiking"],
    localAuthorityIds: ["E06000015", "E10000007", "E10000018"],
    lastUpdated: "2026-05-21T01:00:00Z",
  },
  {
    id: "manchester-active",
    name: "Manchester Active",
    regionId: "north-west",
    opportunities: 412_800,
    activityIds: ["football", "gym", "swimming"],
    localAuthorityIds: ["E08000003", "E08000009", "E08000001"],
    lastUpdated: "2026-05-21T09:00:00Z",
  },
  {
    id: "liverpool-active",
    name: "Liverpool Active",
    regionId: "north-west",
    opportunities: 298_400,
    activityIds: ["swimming", "football", "gym"],
    localAuthorityIds: ["E08000012", "E08000014", "E08000015"],
    lastUpdated: "2026-05-21T08:00:00Z",
  },
  {
    id: "birmingham-community",
    name: "Birmingham Community Leisure",
    regionId: "west-midlands",
    opportunities: 356_200,
    activityIds: ["gym", "swimming", "basketball"],
    localAuthorityIds: ["E08000025", "E08000026", "E08000029"],
    lastUpdated: "2026-05-20T20:00:00Z",
  },
  {
    id: "glasgow-life",
    name: "Glasgow Life",
    regionId: "scotland",
    opportunities: 278_500,
    activityIds: ["football", "swimming", "dance"],
    localAuthorityIds: ["S12000046", "S12000044", "S12000042"],
    lastUpdated: "2026-05-21T07:00:00Z",
  },
  {
    id: "belfast-leisure",
    name: "Belfast Leisure Trust",
    regionId: "northern-ireland",
    opportunities: 89_300,
    activityIds: ["swimming", "gym", "running"],
    localAuthorityIds: ["N09000001", "N09000003"],
    lastUpdated: "2026-05-20T19:00:00Z",
  },
];

/**
 * Local authorities with ONS codes for map joining.
 * Opportunity counts are scaled so the unfiltered sum matches the headline figure.
 */
const localAuthoritiesBase: LocalAuthority[] = [
  { id: "E09000001", name: "City of London", regionId: "london", opportunities: 45_000 },
  { id: "E09000002", name: "Barking and Dagenham", regionId: "london", opportunities: 78_000 },
  { id: "E09000003", name: "Barnet", regionId: "london", opportunities: 112_000 },
  { id: "E09000004", name: "Bexley", regionId: "london", opportunities: 67_000 },
  { id: "E09000005", name: "Brent", regionId: "london", opportunities: 95_000 },
  { id: "E09000007", name: "Camden", regionId: "london", opportunities: 134_000 },
  { id: "E09000012", name: "Hackney", regionId: "london", opportunities: 98_000 },
  { id: "E09000013", name: "Hammersmith and Fulham", regionId: "london", opportunities: 87_000 },
  { id: "E09000019", name: "Islington", regionId: "london", opportunities: 76_000 },
  { id: "E09000020", name: "Kensington and Chelsea", regionId: "london", opportunities: 65_000 },
  { id: "E09000022", name: "Lambeth", regionId: "london", opportunities: 102_000 },
  { id: "E09000023", name: "Lewisham", regionId: "london", opportunities: 89_000 },
  { id: "E09000025", name: "Newham", regionId: "london", opportunities: 94_000 },
  { id: "E09000028", name: "Southwark", regionId: "london", opportunities: 108_000 },
  { id: "E09000030", name: "Tower Hamlets", regionId: "london", opportunities: 91_000 },
  { id: "E09000032", name: "Wandsworth", regionId: "london", opportunities: 115_000 },
  { id: "E09000033", name: "Westminster", regionId: "london", opportunities: 156_000 },
  { id: "E06000001", name: "Hartlepool", regionId: "north-east", opportunities: 23_000 },
  { id: "E06000002", name: "Middlesbrough", regionId: "north-east", opportunities: 34_000 },
  { id: "E06000003", name: "Redcar and Cleveland", regionId: "north-east", opportunities: 28_000 },
  { id: "E06000004", name: "Stockton-on-Tees", regionId: "north-east", opportunities: 41_000 },
  { id: "E08000001", name: "Bolton", regionId: "north-west", opportunities: 56_000 },
  { id: "E08000003", name: "Manchester", regionId: "north-west", opportunities: 187_000 },
  { id: "E08000009", name: "Trafford", regionId: "north-west", opportunities: 61_000 },
  { id: "E08000012", name: "Liverpool", regionId: "north-west", opportunities: 145_000 },
  { id: "E08000014", name: "Sefton", regionId: "north-west", opportunities: 48_000 },
  { id: "E08000015", name: "Wirral", regionId: "north-west", opportunities: 56_000 },
  { id: "E08000019", name: "Sheffield", regionId: "yorkshire", opportunities: 124_000 },
  { id: "E08000025", name: "Birmingham", regionId: "west-midlands", opportunities: 245_000 },
  { id: "E08000026", name: "Coventry", regionId: "west-midlands", opportunities: 78_000 },
  { id: "E08000029", name: "Solihull", regionId: "west-midlands", opportunities: 62_000 },
  { id: "E06000015", name: "Derby", regionId: "east-midlands", opportunities: 67_000 },
  { id: "E10000007", name: "Derbyshire", regionId: "east-midlands", opportunities: 134_000 },
  { id: "E10000003", name: "Cambridgeshire", regionId: "east-of-england", opportunities: 145_000 },
  { id: "E10000012", name: "Essex", regionId: "east-of-england", opportunities: 187_000 },
  { id: "E10000020", name: "Norfolk", regionId: "east-of-england", opportunities: 134_000 },
  { id: "E06000043", name: "Brighton and Hove", regionId: "south-east", opportunities: 89_000 },
  { id: "E10000016", name: "Kent", regionId: "south-east", opportunities: 234_000 },
  { id: "E10000030", name: "Surrey", regionId: "south-east", opportunities: 189_000 },
  { id: "E06000022", name: "Bath and North East Somerset", regionId: "south-west", opportunities: 45_000 },
  { id: "E06000023", name: "Bristol", regionId: "south-west", opportunities: 134_000 },
  { id: "E10000008", name: "Devon", regionId: "south-west", opportunities: 145_000 },
  { id: "S12000036", name: "City of Edinburgh", regionId: "scotland", opportunities: 134_000 },
  { id: "S12000046", name: "Glasgow City", regionId: "scotland", opportunities: 156_000 },
  { id: "W06000015", name: "Cardiff", regionId: "wales", opportunities: 89_000 },
  { id: "N09000001", name: "Belfast", regionId: "northern-ireland", opportunities: 52_000 },
  { id: "N09000003", name: "Lisburn and Castlereagh", regionId: "northern-ireland", opportunities: 37_300 },
];

/** Headline total for the unfiltered explorer (matches design reference) */
export const EXPLORER_HEADLINE_OPPORTUNITIES = 14_706_698;

const laBaseSum = localAuthoritiesBase.reduce((s, la) => s + la.opportunities, 0);
const laScale = EXPLORER_HEADLINE_OPPORTUNITIES / laBaseSum;

/** Local authorities with counts scaled to the headline opportunity total */
export const localAuthorities: LocalAuthority[] = localAuthoritiesBase.map((la) => ({
  ...la,
  opportunities: Math.round(la.opportunities * laScale),
}));
