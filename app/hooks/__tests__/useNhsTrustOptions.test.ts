/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useNhsTrustOptions } from "../useNhsTrustOptions";
import { getAllNHSTrusts } from "../../services/nhs-trusts";

vi.mock("../../services/nhs-trusts", () => ({
  getAllNHSTrusts: vi.fn(),
}));

const mockedGetAllNHSTrusts = vi.mocked(getAllNHSTrusts);

describe("useNhsTrustOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stays idle and does not fetch when disabled", () => {
    const { result } = renderHook(() => useNhsTrustOptions(false));

    expect(mockedGetAllNHSTrusts).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.options).toEqual([]);
  });

  it("loads trust options when enabled", async () => {
    mockedGetAllNHSTrusts.mockResolvedValue([
      { nhstrust_code: "R0A", nhstrust_name: "Manchester University NHS Foundation Trust" },
      { nhstrust_code: "R1H", nhstrust_name: "Barts Health NHS Trust" },
    ]);

    const { result } = renderHook(() => useNhsTrustOptions(true));

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.options).toEqual([
      { value: "R0A", label: "Manchester University NHS Foundation Trust" },
      { value: "R1H", label: "Barts Health NHS Trust" },
    ]);
  });

  it("sets error status when the fetch fails", async () => {
    mockedGetAllNHSTrusts.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useNhsTrustOptions(true));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.options).toEqual([]);
  });

  it("only fetches once even if the hook re-renders while enabled", async () => {
    mockedGetAllNHSTrusts.mockResolvedValue([
      { nhstrust_code: "R0A", nhstrust_name: "Manchester University NHS Foundation Trust" },
    ]);

    const { rerender } = renderHook(() => useNhsTrustOptions(true));

    await waitFor(() => {
      expect(mockedGetAllNHSTrusts).toHaveBeenCalledTimes(1);
    });

    rerender();

    expect(mockedGetAllNHSTrusts).toHaveBeenCalledTimes(1);
  });
});
