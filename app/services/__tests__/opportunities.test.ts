import { before } from "node:test";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("getOpportunities", () => {
  let getOpportunities: typeof import("../opportunities").getOpportunities;
  let apiFetch: typeof import("../api-client").apiFetch;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    ({ apiFetch } = await import("../api-client"));
    vi.mocked(apiFetch).mockResolvedValue([]);

    ({ getOpportunities } = await import("../opportunities"));
  });

  it("calls /opportunities with no query string when filters are empty", async () => {
    await getOpportunities();

    expect(apiFetch).toHaveBeenCalledWith("/opportunities", {
      revalidate: 300,
    });
  });

  it("passes filter params in the query string", async () => {
    await getOpportunities({
      district: ["E06000001"],
      publisher: ["Active Hartlepool"],
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/opportunities?district=E06000001&publisher=Active+Hartlepool",
      { revalidate: 300 },
    );
  });
});
