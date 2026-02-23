import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUserMock = vi.fn();
const runsFindFirstMock = vi.fn();
const runUsersFindFirstMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthUser: getAuthUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      runs: { findFirst: runsFindFirstMock },
      runUsers: { findFirst: runUsersFindFirstMock },
    },
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("runs and chat api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/runs returns 401 when unauthenticated", async () => {
    getAuthUserMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/runs/route");

    const response = await POST(
      new Request("http://localhost/api/runs", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/runs/:id/join returns 400 for invalid id", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 11, role: "runner" });
    const { POST } = await import("@/app/api/runs/[id]/join/route");

    const response = await POST(new Request("http://localhost/api/runs/x/join", { method: "POST" }), {
      params: Promise.resolve({ id: "abc" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/chat/:runId/messages returns 400 for invalid runId", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 11, role: "runner" });
    const { GET } = await import("@/app/api/chat/[runId]/messages/route");

    const response = await GET(new Request("http://localhost/api/chat/abc/messages"), {
      params: Promise.resolve({ runId: "abc" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });

  it("GET /api/chat/:runId/messages returns 403 for non-member (IDOR protection)", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 11, role: "runner" });
    runsFindFirstMock.mockResolvedValue({ runId: 9, hostUserId: 99, title: "Tempo" });
    runUsersFindFirstMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/chat/[runId]/messages/route");
    const response = await GET(new Request("http://localhost/api/chat/9/messages"), {
      params: Promise.resolve({ runId: "9" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FORBIDDEN");
  });
});
