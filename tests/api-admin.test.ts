import { beforeEach, describe, expect, it, vi } from "vitest";

const getAuthUserMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthUser: getAuthUserMock,
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("admin api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/admin/users returns 401 when unauthenticated", async () => {
    getAuthUserMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/admin/users/route");
    const response = await GET();
    const payload = await response.json();
    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /api/admin/users returns 403 for non-admin", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 2, role: "runner" });
    const { GET } = await import("@/app/api/admin/users/route");
    const response = await GET();
    const payload = await response.json();
    expect(response.status).toBe(403);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FORBIDDEN");
  });

  it("DELETE /api/admin/runs/:id returns 403 for non-admin", async () => {
    getAuthUserMock.mockResolvedValue({ userId: 2, role: "runner" });
    const { DELETE } = await import("@/app/api/admin/runs/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/admin/runs/1"), {
      params: Promise.resolve({ id: "1" }),
    });
    const payload = await response.json();
    expect(response.status).toBe(403);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("FORBIDDEN");
  });
});
