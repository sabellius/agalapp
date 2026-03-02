import { beforeEach, describe, expect, it, vi } from "vitest";
import { geocodeAddress } from "./geocoding";

global.fetch = vi.fn();

describe("geocodeAddress", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns coordinates for valid address", async () => {
    const mockResponse = [
      {
        lat: "32.0853",
        lon: "34.7818",
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geocodeAddress("Rothschild 1", "Tel Aviv");

    expect(result).toEqual({
      latitude: 32.0853,
      longitude: 34.7818,
    });
  });

  it("returns null for empty response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const result = await geocodeAddress("Nonexistent", "Nowhere");

    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await geocodeAddress("Rothschild 1", "Tel Aviv");

    expect(result).toBeNull();
  });

  it("returns null on non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const result = await geocodeAddress("Rothschild 1", "Tel Aviv");

    expect(result).toBeNull();
  });

  it("uses correct URL with encoded parameters", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ lat: "32", lon: "34" }],
    } as Response);

    await geocodeAddress("Rothschild 1", "Tel Aviv");

    expect(fetch).toHaveBeenCalled();
    const callArgs = vi.mocked(fetch).mock.calls[0];
    expect(callArgs[0]).toContain("Rothschild");
    expect(callArgs[0]).toContain("Tel");
  });
});
