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
  it.each([
    [null, "na"],
    [0, "none"],
    [34, "low"],
    [35, "moderate"],
    [70, "high"],
  ] as const)("maps %s to %s", (value, band) => {
    expect(getCompletenessBand(value)).toBe(band);
  });
});

describe("humaniseFeedType / getFeedStreamLabel", () => {
  it("humanises PascalCase feed types", () => {
    expect(humaniseFeedType("ScheduledSession")).toBe("Scheduled session");
  });

  it("uses the feed URL segment when feed_type is missing", () => {
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
  it("uses singular for one and plural otherwise", () => {
    expect(formatDataStreamCount(1)).toBe("1 data stream");
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
    const hartlepool = groups.find(
      (g) => g.datasetName === "Active Hartlepool"
    );

    expect(hartlepool?.feeds).toHaveLength(2);
    expect(hartlepool?.worstStatus).toBe("WARNING");
  });

  it("replaces generic dataset names with a humanised subdomain", () => {
    const lewes = groupFeedsByDataset(sampleFeedQualityRows).find(
      (g) => g.datasetUrl === "https://lewes-leisure.openactive.io"
    );
    expect(lewes?.datasetName).toBe("Lewes Leisure");
  });

  it("keeps a real dataset name when it is not generic", () => {
    expect(
      groupFeedsByDataset(sampleFeedQualityRows).some(
        (g) => g.datasetName === "Highland Active"
      )
    ).toBe(true);
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
    expect(VIEW_CONFIGS.content.getScore(sampleFeedQualityRows[0]!)).toBe(
      (55 + 50 + 45 + 40) / 4
    );
  });

  it("returns -1 for unscored groups so they sink when sorting", () => {
    const group = groupFeedsByDataset([sampleFeedQualityRows[3]!])[0]!;
    expect(VIEW_CONFIGS.data.getGroupScore(group)).toBe(-1);
  });

  it("averages scorable feeds for a group score", () => {
    const group = groupFeedsByDataset(sampleFeedQualityRows.slice(0, 2))[0]!;
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

  it.each([
    ["2026-01-15T12:00:00.000Z", "Just now"],
    ["2026-01-15T11:30:00.000Z", "30 min ago"],
    ["2026-01-15T10:00:00.000Z", "2 hours ago"],
    ["2026-01-14T12:00:00.000Z", "1 day ago"],
  ] as const)("formats %s as %s", (iso, relative) => {
    expect(formatLastAssessed(iso).relative).toBe(relative);
  });
});
