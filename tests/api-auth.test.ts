import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const sessionsFindFirstMock = vi.fn();
const usersFindFirstMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findFirst: sessionsFindFirstMock },
      users: { findFirst: usersFindFirstMock },
    },
  },
}));

describe("auth api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/auth/login returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email", password: "" }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("POST /api/auth/register returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const response = await POST(
      new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "bad-email",
          password: "123",
          korisnickoIme: "ab",
          starost: 5,
          pol: "invalid",
          nivoKondicije: "invalid",
          tempoTrcanja: -1,
        }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/auth/me returns 401 when session cookie is missing", async () => {
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => undefined),
    });

    const { GET } = await import("@/app/api/auth/me/route");
    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });
});
