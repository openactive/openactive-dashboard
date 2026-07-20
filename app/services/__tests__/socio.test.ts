import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("getSocioContext", () => {
  let getSocioContext: typeof import("../socio").getSocioContext;
  let apiFetch: typeof import("../api-client").apiFetch;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    ({ apiFetch } = await import("../api-client"));
    vi.mocked(apiFetch).mockResolvedValue([]);

    ({ getSocioContext } = await import("../socio"));
  });

  it("calls /socio with no query string when filters are empty", async () => {
    await getSocioContext();

    expect(apiFetch).toHaveBeenCalledWith("/socio", {
      revalidate: 1800,
    });
  });

  it("passes district, region, and country in the query string", async () => {
    await getSocioContext({
      district: ["E06000001"],
      region: ["E12000001"],
      country: ["E92000001"],
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/socio?district=E06000001&region=E12000001&country=E92000001",
      { revalidate: 1800 },
    );
  });
});
