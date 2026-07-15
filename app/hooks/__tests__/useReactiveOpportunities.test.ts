/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useReactiveOpportunities } from "../useReactiveOpportunities";
import { DEFAULT_EXPLORER_FILTERS } from "@/app/lib/explore-filters";
import { sampleLadOpportunities, testHierarchy } from "@/app/lib/__fixtures__";
import { getOpportunities } from "@/app/services/opportunities";

vi.mock("@/app/services/opportunities", () => ({
  getOpportunities: vi.fn(),
}));

const mockGetOpportunities = vi.mocked(getOpportunities);

describe("useReactiveOpportunities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads opportunities and builds summary counts", async () => {
    mockGetOpportunities.mockResolvedValue(sampleLadOpportunities);

    const { result } = renderHook(() =>
      useReactiveOpportunities({
        filters: DEFAULT_EXPLORER_FILTERS,
        hierarchy: testHierarchy,
      }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary.totalOpportunities).toBe(67);
    expect(result.current.districtCounts[0]).toEqual({
      district: "Hartlepool",
      count: 42,
    });
  });

  it("calls onResolved with the present publisher name", async () => {
    mockGetOpportunities.mockResolvedValue(sampleLadOpportunities);
    const onResolved = vi.fn();

    renderHook(() =>
      useReactiveOpportunities({
        filters: DEFAULT_EXPLORER_FILTERS,
        hierarchy: testHierarchy,
        onResolved,
      }),
    );

    await waitFor(() => {
      expect(onResolved).toHaveBeenCalled();
    });

    const present = onResolved.mock.calls[0]![0];
    expect(present.publishers.has("Active Hartlepool")).toBe(true);
  });

  it("reuses the cached request when filters do not change", async () => {
    mockGetOpportunities.mockResolvedValue(sampleLadOpportunities);

    const { rerender } = renderHook(() =>
      useReactiveOpportunities({
        filters: DEFAULT_EXPLORER_FILTERS,
        hierarchy: testHierarchy,
      }),
    );

    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenCalledTimes(1);
    });

    rerender();

    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps previous data when a later request fails", async () => {
    mockGetOpportunities.mockResolvedValue(sampleLadOpportunities)

    const { result, rerender } = renderHook(
      ({ filters }) =>
        useReactiveOpportunities({
          filters,
          hierarchy: testHierarchy,
        }),
      { initialProps: { filters: DEFAULT_EXPLORER_FILTERS } },
    );

    await waitFor(() => {
      expect(result.current.summary.totalOpportunities).toBe(67);
    });

    mockGetOpportunities.mockRejectedValueOnce(new Error("network down"));

    rerender({
      filters: {
        ...DEFAULT_EXPLORER_FILTERS,
        publisher: ["Active Hartlepool"],
      },
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary.totalOpportunities).toBe(67);
  });
});
