/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useFeedQuality } from "../useFeedQuality";
import { sampleFeedQualityRows } from "../../lib/__fixtures__";
import { getFeedQuality } from "../../services/feed-quality";

vi.mock("../../services/feed-quality", () => ({
  getFeedQuality: vi.fn(),
}));

const mockedGetFeedQuality = vi.mocked(getFeedQuality);

describe("useFeedQuality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not fetch when disabled", () => {
    const { result } = renderHook(() => useFeedQuality(false));

    expect(mockedGetFeedQuality).not.toHaveBeenCalled();
    expect(result.current.rows).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("loads rows and groups them by dataset", async () => {
    mockedGetFeedQuality.mockResolvedValue(sampleFeedQualityRows);

    const { result } = renderHook(() => useFeedQuality(true, {}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rows).toHaveLength(sampleFeedQualityRows.length);
    expect(result.current.groups.length).toBeGreaterThan(0);
    expect(
      result.current.groups.some((g) => g.datasetName === "Active Hartlepool")
    ).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("stores an error message when the fetch fails", async () => {
    mockedGetFeedQuality.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useFeedQuality(true, {}));

    await waitFor(() => {
      expect(result.current.error).toBe("network down");
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.rows).toEqual([]);
  });

  it("retries after a failed fetch", async () => {
    mockedGetFeedQuality.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useFeedQuality(true, {}));

    await waitFor(() => {
      expect(result.current.error).toBe("network down");
    });

    mockedGetFeedQuality.mockResolvedValue(sampleFeedQualityRows);

    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.rows).toHaveLength(sampleFeedQualityRows.length);
    });

    expect(result.current.error).toBeNull();
    expect(mockedGetFeedQuality.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
