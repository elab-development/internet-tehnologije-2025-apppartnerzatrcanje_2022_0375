import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findFirst: vi.fn() },
      users: { findFirst: vi.fn() },
    },
    select: vi.fn(),
    update: vi.fn(),
  },
}));

describe("profile api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/profile/me returns 401 when unauthenticated", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => undefined),
    });

    const { GET } = await import("@/app/api/profile/me/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("PATCH /api/profile/me returns 401 when unauthenticated", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => undefined),
    });

    const { PATCH } = await import("@/app/api/profile/me/route");
    const response = await PATCH(
      new Request("http://localhost/api/profile/me", {
        method: "PATCH",
        body: JSON.stringify({}),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });
});
