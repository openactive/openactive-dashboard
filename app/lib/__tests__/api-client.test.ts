import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("apiFetch", () => {
  let apiFetch: typeof import("../../services/api-client").apiFetch;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllGlobals();

    process.env.OPENACTIVE_API_BASE_URL = "https://api.example.com/";
    process.env.OPENACTIVE_API_TOKEN = "test-token";

    ({ apiFetch } = await import("../../services/api-client"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds the token and returns JSON on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ total: 3 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiFetch<{ total: number }>("/opportunities"),
    ).resolves.toEqual({
      total: 3,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/opportunities?token=test-token",
      { next: { revalidate: 300 } },
    );
  });

  it("uses a custom revalidate value when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/summary", { revalidate: 1800 });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/summary?token=test-token",
      { next: { revalidate: 1800 } },
    );
  });

  it("throws an ApiError when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(apiFetch("/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "API request failed: 404 Not Found",
    });
  });
});
