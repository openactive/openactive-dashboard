/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSocioContext } from "../useSocioContext";
import { DEFAULT_EXPLORER_FILTERS } from "../../lib/explore-filters";
import {
  HARTLEPOOL,
  hartlepoolSocioRow,
  testHierarchy,
} from "../../lib/__fixtures__";
import { districtRef } from "../../lib/area-selection";
import { getSocioContext } from "../../services/socio";

vi.mock("../../services/socio", () => ({
  getSocioContext: vi.fn(),
}));

const mockGetSocioContext = vi.mocked(getSocioContext);

describe("useSocioContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads socio rows and resolves a single England local authority view", async () => {
    mockGetSocioContext.mockResolvedValue([hartlepoolSocioRow]);

    const { result } = renderHook(() =>
      useSocioContext({
        filters: {
          ...DEFAULT_EXPLORER_FILTERS,
          areas: [districtRef(HARTLEPOOL.name)],
        },
        hierarchy: testHierarchy,
        totalOpportunities: 5000,
      }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.context.scope).toBe("single-lad");
    expect(result.current.context.ladRow).toEqual(hartlepoolSocioRow);
    expect(result.current.context.opportunitiesPer1000).toBeCloseTo(50.93, 1);
  });

  it("does not fetch in NHS mode", async () => {
    const { result } = renderHook(() =>
      useSocioContext({
        filters: {
          ...DEFAULT_EXPLORER_FILTERS,
          boundaryType: "nhs",
          nhsTrusts: ["R0A"],
        },
        hierarchy: testHierarchy,
        totalOpportunities: 100,
      }),
    );

    expect(mockGetSocioContext).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.context.scope).toBe("empty");
  });

  it("recomputes opportunities per 1000 when opportunity total changes", async () => {
    mockGetSocioContext.mockResolvedValue([hartlepoolSocioRow]);

    const { result, rerender } = renderHook(
      ({ totalOpportunities }) =>
        useSocioContext({
          filters: {
            ...DEFAULT_EXPLORER_FILTERS,
            areas: [districtRef(HARTLEPOOL.name)],
          },
          hierarchy: testHierarchy,
          totalOpportunities,
        }),
      { initialProps: { totalOpportunities: 5000 } },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.context.opportunitiesPer1000).toBeCloseTo(50.93, 1);

    rerender({ totalOpportunities: 10000 });

    expect(mockGetSocioContext).toHaveBeenCalledTimes(1);
    expect(result.current.context.opportunitiesPer1000).toBeCloseTo(101.85, 1);
  });
});
