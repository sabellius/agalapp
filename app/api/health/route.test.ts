import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok status", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("returns version fields", async () => {
    const body = await (await GET()).json();

    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("commit");
    expect(body).toHaveProperty("buildTime");
  });
});
