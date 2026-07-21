/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLocationScopedFilterOptions } from "../useLocationScopedFilterOptions";
import {
  ALL_FILTER,
  DEFAULT_EXPLORER_FILTERS,
  FILTER_EMPTY_VALUE,
  FILTER_LOADING_VALUE,
  type BoundaryType,
} from "../../lib/explore-filters";
import { testHierarchy } from "../../lib/__fixtures__";

const baseProps = {
  item: "publishers" as const,
  allLabel: "All publishers",
  loadingLabel: "Loading publishers…",
  hierarchy: testHierarchy,
  filters: {
    areas: DEFAULT_EXPLORER_FILTERS.areas,
    boundaryType: DEFAULT_EXPLORER_FILTERS.boundaryType,
    nhsTrusts: DEFAULT_EXPLORER_FILTERS.nhsTrusts,
  },
};

describe("useLocationScopedFilterOptions", () => {
  let fetchNames: ReturnType<typeof vi.fn<() => Promise<string[]>>>;

  beforeEach(() => {
    fetchNames = vi.fn<() => Promise<string[]>>();
  });

  it("shows loaded names under the All option", async () => {
    fetchNames.mockResolvedValue(["Active Hartlepool", "Lewes Leisure"]);

    const { result } = renderHook(() =>
      useLocationScopedFilterOptions({
        ...baseProps,
        fetchNames,
      }),
    );

    await waitFor(() => {
      expect(result.current.some((o) => o.value === "Active Hartlepool")).toBe(
        true,
      );
    });

    expect(result.current[0]).toEqual({
      value: ALL_FILTER,
      label: "All publishers",
    });
    expect(result.current.map((o) => o.value)).toEqual([
      ALL_FILTER,
      "Active Hartlepool",
      "Lewes Leisure",
    ]);
  });

  it("shows an empty message when there are no names", async () => {
    fetchNames.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useLocationScopedFilterOptions({
        ...baseProps,
        fetchNames,
      }),
    );

    await waitFor(() => {
      expect(result.current[0]?.value).toBe(FILTER_EMPTY_VALUE);
    });

    expect(result.current[0]?.label).toBe("No publishers found");
  });

  it("resets to All when the fetch fails", async () => {
    fetchNames.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() =>
      useLocationScopedFilterOptions({
        ...baseProps,
        fetchNames,
      }),
    );

    await waitFor(() => {
      expect(result.current).toEqual([
        { value: ALL_FILTER, label: "All publishers" },
      ]);
    });
  });

  it("does not fetch when disabled", async () => {
    fetchNames.mockResolvedValue(["Active Hartlepool"]);

    const { result } = renderHook(() =>
      useLocationScopedFilterOptions({
        ...baseProps,
        enabled: false,
        fetchNames,
      }),
    );

    expect(fetchNames).not.toHaveBeenCalled();
    expect(result.current).toEqual([
      { value: ALL_FILTER, label: "All publishers" },
    ]);
    expect(result.current.some((o) => o.value === FILTER_LOADING_VALUE)).toBe(
      false,
    );
  });

  it("refetches with nhs_trust=all when boundary switches to NHS with no trust", async () => {
    fetchNames.mockResolvedValue(["NHS Publisher"]);

    const { rerender } = renderHook(
      ({ filters }) => useLocationScopedFilterOptions({
        ...baseProps,
        filters,
        fetchNames,
      }),
      {
        initialProps: {
          filters: {
            areas: [] as string[],
            boundaryType: "lad" as BoundaryType,
            nhsTrusts: [] as string[],
          },
        },
      },
    );

    await waitFor(() => {
      expect(fetchNames).toHaveBeenCalledTimes(1);
    });

    rerender({
      filters: {
        areas: [] as string[],
        boundaryType: "nhs" as const,
        nhsTrusts: [] as string[],
      },
    });

    await waitFor(() => {
      expect(fetchNames).toHaveBeenCalledTimes(2);
    });

    expect(fetchNames).toHaveBeenCalledWith(
      expect.objectContaining({ nhs_trust: [ALL_FILTER] }),
    );
  });
});
