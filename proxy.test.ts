// @vitest-environment node
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn(),
}));

const mockedGetSessionCookie = vi.mocked(getSessionCookie);

function makeRequest(path: string): NextRequest {
  return new NextRequest(`https://agalapp.example.com${path}`);
}

describe("proxy", () => {
  beforeEach(() => {
    mockedGetSessionCookie.mockReturnValue(null);
  });

  it("redirects unauthenticated users to sign-in with redirectTo", () => {
    const response = proxy(makeRequest("/dashboard"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/auth/sign-in");
    expect(location.searchParams.get("redirectTo")).toBe("/dashboard");
  });

  it("preserves nested path as redirectTo", () => {
    const response = proxy(makeRequest("/trucks/abc123/edit"));

    const location = new URL(response.headers.get("location") ?? "");
    expect(location.searchParams.get("redirectTo")).toBe("/trucks/abc123/edit");
  });

  it("passes authenticated users through", () => {
    mockedGetSessionCookie.mockReturnValue("session-token");

    const response = proxy(makeRequest("/dashboard"));

    expect(response.status).toBe(200);
  });

  it("redirects authenticated users away from auth pages", () => {
    mockedGetSessionCookie.mockReturnValue("session-token");

    const response = proxy(makeRequest("/auth/sign-in"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/dashboard");
  });

  it("passes unauthenticated users through on auth pages", () => {
    const response = proxy(makeRequest("/auth/sign-in"));

    expect(response.status).toBe(200);
  });
});
