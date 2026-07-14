import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedQualityRow } from "../../types/feed-quality";
import {
  formatDataStreamCount,
  formatLastAssessed,
  getCompletenessBand,
  getFeedStreamLabel,
  getGroupActivityCount,
  groupFeedsByDataset,
  humaniseFeedType,
  STATUS_RANK,
  VIEW_CONFIGS,
} from "../feed-quality";
import { sampleFeedQualityRows } from "../__fixtures__";

function row(
  overrides: Partial<FeedQualityRow> &
    Pick<FeedQualityRow, "feed_type" | "dataset_name">
): FeedQualityRow {
  return {
    dataset_url: "https://example.openactive.io",
    feed_url: "https://example.openactive.io/feed",
    status: "OK",
    warnings: [],
    errors: [],
    location_completeness: null,
    start_date_completeness: null,
    end_date_completeness: null,
    activities_completeness: null,
    facilities_completeness: null,
    age_range_completeness: null,
    level_completeness: null,
    accessibility_support_completeness: null,
    gender_restriction_completeness: null,
    num_future_opportunity_items: 0,
    feed_version: "1.0",
    last_assessed: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

describe("getCompletenessBand", () => {
  it("maps null and numeric thresholds to bands", () => {
    expect(getCompletenessBand(null)).toBe("na");
    expect(getCompletenessBand(0)).toBe("none");
    expect(getCompletenessBand(1)).toBe("low");
    expect(getCompletenessBand(34)).toBe("low");
    expect(getCompletenessBand(35)).toBe("moderate");
    expect(getCompletenessBand(69)).toBe("moderate");
    expect(getCompletenessBand(70)).toBe("high");
    expect(getCompletenessBand(100)).toBe("high");
  });
});

describe("humaniseFeedType / getFeedStreamLabel", () => {
  it("humanises PascalCase feed types", () => {
    expect(humaniseFeedType("ScheduledSession")).toBe("Scheduled session");
    expect(humaniseFeedType("FacilityUse")).toBe("Facility use");
  });

  it("uses feed_type when present, otherwise the feed URL segment", () => {
    expect(getFeedStreamLabel(sampleFeedQualityRows[0]!)).toBe(
      "Scheduled session"
    );

    expect(
      getFeedStreamLabel(
        row({
          dataset_name: "Example",
          feed_type: "",
          feed_url: "https://example.openactive.io/facility-use",
        })
      )
    ).toBe("facility use");
  });

  it('falls back to "Data stream" when type and URL give nothing useful', () => {
    expect(
      getFeedStreamLabel(
        row({
          dataset_name: "Example",
          feed_type: "",
          feed_url: "",
        })
      )
    ).toBe("Data stream");
  });
});

describe("formatDataStreamCount", () => {
  it("uses singular and plural labels", () => {
    expect(formatDataStreamCount(1)).toBe("1 data stream");
    expect(formatDataStreamCount(0)).toBe("0 data streams");
    expect(formatDataStreamCount(3)).toBe("3 data streams");
  });
});

describe("STATUS_RANK", () => {
  it("ranks worse statuses higher", () => {
    expect(STATUS_RANK.OK).toBeLessThan(STATUS_RANK.WARNING);
    expect(STATUS_RANK.WARNING).toBeLessThan(STATUS_RANK.ERROR);
  });
});

describe("groupFeedsByDataset", () => {
  it("groups by dataset_url and uses the worst status in the group", () => {
    const groups = groupFeedsByDataset(sampleFeedQualityRows);

    expect(groups).toHaveLength(3);

    const hartlepool = groups.find(
      (g) => g.datasetName === "Active Hartlepool"
    );
    expect(hartlepool?.feeds).toHaveLength(2);
    expect(hartlepool?.worstStatus).toBe("WARNING");
    expect(hartlepool?.datasetUrl).toBe("https://example.openactive.io");
  });

  it("replaces generic dataset names with a humanised subdomain", () => {
    const groups = groupFeedsByDataset(sampleFeedQualityRows);
    const lewes = groups.find(
      (g) => g.datasetUrl === "https://lewes-leisure.openactive.io"
    );

    expect(lewes?.datasetName).toBe("Lewes Leisure");
    expect(lewes?.worstStatus).toBe("ERROR");
  });

  it("keeps a real dataset name when it is not generic", () => {
    const groups = groupFeedsByDataset(sampleFeedQualityRows);
    expect(
      groups.find((g) => g.datasetName === "Highland Active")
    ).toBeDefined();
  });
});

describe("getGroupActivityCount", () => {
  it("sums opportunity items across feeds in a group", () => {
    const [hartlepool] = groupFeedsByDataset(sampleFeedQualityRows.slice(0, 2));
    expect(getGroupActivityCount(hartlepool!)).toBe(200);
  });
});

describe("VIEW_CONFIGS scoring", () => {
  it("averages data completeness fields for a row", () => {
    // 90 + 75 + 70 + 85 (activities preferred over facilities) / 4
    expect(VIEW_CONFIGS.data.getScore(sampleFeedQualityRows[0]!)).toBe(
      (90 + 75 + 70 + 85) / 4
    );
  });

  it("uses facilities when activities completeness is null", () => {
    const feed = row({
      dataset_name: "Facility feed",
      feed_type: "FacilityUse",
      location_completeness: 80,
      start_date_completeness: 80,
      end_date_completeness: 80,
      facilities_completeness: 40,
    });
    expect(VIEW_CONFIGS.data.getScore(feed)).toBe((80 + 80 + 80 + 40) / 4);
  });

  it("returns null for a row with no scorable data fields", () => {
    expect(VIEW_CONFIGS.data.getScore(sampleFeedQualityRows[3]!)).toBeNull();
  });

  it("averages content completeness fields for a row", () => {
    // base fixture: 55, 50, 45, 40
    expect(VIEW_CONFIGS.content.getScore(sampleFeedQualityRows[0]!)).toBe(
      (55 + 50 + 45 + 40) / 4
    );
  });

  it("returns -1 for unscored groups so they sink when sorting", () => {
    const groups = groupFeedsByDataset([sampleFeedQualityRows[3]!]);
    expect(VIEW_CONFIGS.data.getGroupScore(groups[0]!)).toBe(-1);
    expect(VIEW_CONFIGS.content.getGroupScore(groups[0]!)).toBe(-1);
  });

  it("averages scorable feeds for a group score", () => {
    const groups = groupFeedsByDataset(sampleFeedQualityRows.slice(0, 2));
    const group = groups[0]!;
    const expected =
      (VIEW_CONFIGS.data.getScore(group.feeds[0]!)! +
        VIEW_CONFIGS.data.getScore(group.feeds[1]!)!) /
      2;
    expect(VIEW_CONFIGS.data.getGroupScore(group)).toBe(expected);
  });
});

describe("formatLastAssessed", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats absolute en-GB time and relative phrases", () => {
    expect(formatLastAssessed("2026-01-15T12:00:00.000Z").relative).toBe(
      "Just now"
    );
    expect(formatLastAssessed("2026-01-15T11:30:00.000Z").relative).toBe(
      "30 min ago"
    );
    expect(formatLastAssessed("2026-01-15T10:00:00.000Z").relative).toBe(
      "2 hours ago"
    );
    expect(formatLastAssessed("2026-01-14T12:00:00.000Z").relative).toBe(
      "1 day ago"
    );
    expect(formatLastAssessed("2026-01-13T12:00:00.000Z").relative).toBe(
      "2 days ago"
    );

    const { absolute } = formatLastAssessed("2026-01-15T10:00:00.000Z");
    expect(absolute.length).toBeGreaterThan(0);
  });
});
