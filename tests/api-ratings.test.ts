import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUserMock = vi.fn();
const runsFindFirstMock = vi.fn();
const runUsersFindFirstMock = vi.fn();
const ratingsFindFirstMock = vi.fn();
const insertReturningMock = vi.fn();
const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));
const insertMock = vi.fn(() => ({ values: insertValuesMock }));
const updateReturningMock = vi.fn();
const updateSetMock = vi.fn(() => ({ where: vi.fn(() => ({ returning: updateReturningMock })) }));
const updateMock = vi.fn(() => ({ set: updateSetMock }));
const deleteWhereMock = vi.fn();
const deleteMock = vi.fn(() => ({ where: deleteWhereMock }));

vi.mock("@/lib/auth", () => ({
  getAuthUser: getAuthUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      runs: { findFirst: runsFindFirstMock },
      runUsers: { findFirst: runUsersFindFirstMock },
      ratings: { findFirst: ratingsFindFirstMock },
    },
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

describe("ratings api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/ratings returns 401 when unauthenticated", async () => {
    getAuthUserMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/ratings/route");
    const response = await POST(
      new Request("http://localhost/api/ratings", {
        method: "POST",
        body: JSON.stringify({ runId: 1, score: 5, comment: "Top" }),
      })
    );
    const payload = await response.json();
    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/ratings returns 403 for non-participant", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 10, role: "runner" });
    runsFindFirstMock.mockResolvedValue({ runId: 1, hostUserId: 20 });
    runUsersFindFirstMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/ratings/route");

    const response = await POST(
      new Request("http://localhost/api/ratings", {
        method: "POST",
        body: JSON.stringify({ runId: 1, score: 5, comment: "Top" }),
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FORBIDDEN");
  });

  it("PATCH /api/ratings/:id allows author", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 10, role: "runner" });
    ratingsFindFirstMock.mockResolvedValue({ ratingId: 7, fromUserId: 10 });
    updateReturningMock.mockResolvedValue([{ ratingId: 7, runId: 1, score: 4, comment: "ok", fromUserId: 10, toUserId: 20 }]);
    const { PATCH } = await import("@/app/api/ratings/[id]/route");

    const response = await PATCH(
      new Request("http://localhost/api/ratings/7", {
        method: "PATCH",
        body: JSON.stringify({ score: 4, comment: "ok" }),
      }),
      { params: Promise.resolve({ id: "7" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.rating.ratingId).toBe(7);
  });

  it("DELETE /api/ratings/:id allows admin", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 1, role: "admin" });
    ratingsFindFirstMock.mockResolvedValue({ ratingId: 8, fromUserId: 99 });
    const { DELETE } = await import("@/app/api/ratings/[id]/route");

    const response = await DELETE(new Request("http://localhost/api/ratings/8", { method: "DELETE" }), {
      params: Promise.resolve({ id: "8" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(deleteWhereMock).toHaveBeenCalledTimes(1);
  });
});
