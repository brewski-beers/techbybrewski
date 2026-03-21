import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockVerifyIdToken, mockSetCustomUserClaims } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    setCustomUserClaims: mockSetCustomUserClaims,
  },
}));

import { POST } from "../route";
import { NextRequest } from "next/server";

function makeRequest(opts: {
  authHeader?: string;
  body?: Record<string, unknown>;
}): NextRequest {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (opts.authHeader !== undefined) {
    headers["authorization"] = opts.authHeader;
  }
  return new NextRequest("http://localhost/api/admin/set-claims", {
    method: "POST",
    headers,
    body: JSON.stringify(opts.body ?? {}),
  });
}

describe("POST /api/admin/set-claims", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no auth token is provided", async () => {
    // Given: verifyIdToken throws (empty string is not a valid token)
    mockVerifyIdToken.mockRejectedValueOnce(new Error("No token"));

    // When: request is made without an Authorization header
    const req = makeRequest({ body: { uid: "user-1", claims: { client: true } } });
    const res = await POST(req);

    // Then: response is 401 Unauthorized
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when authenticated but caller is not an admin", async () => {
    // Given: token is valid but decoded token has no admin claim
    // Note: the route currently returns 401 (not 403) for the non-admin case —
    // this test documents that existing behavior.
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "user-2", admin: false });

    // When: request is made with a valid but non-admin token
    const req = makeRequest({
      authHeader: "Bearer valid-but-non-admin-token",
      body: { uid: "target-user", claims: { client: true } },
    });
    const res = await POST(req);

    // Then: response is 401 (documented behavior — route uses 401 for both unauthenticated and non-admin)
    expect(res.status).toBe(401);
  });

  it("returns 200 and sets claims when authenticated admin posts valid payload", async () => {
    // Given: token decodes to an admin user
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "admin-1", admin: true });
    mockSetCustomUserClaims.mockResolvedValueOnce(undefined);

    // When: admin posts a valid uid + claims payload
    const req = makeRequest({
      authHeader: "Bearer valid-admin-token",
      body: { uid: "target-user", claims: { client: true } },
    });
    const res = await POST(req);

    // Then: claims are set and response is 200
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockSetCustomUserClaims).toHaveBeenCalledWith("target-user", { client: true });
  });

  it("returns 400 when uid or claims are missing from payload", async () => {
    // Given: token decodes to an admin user
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "admin-1", admin: true });

    // When: admin posts payload without required fields
    const req = makeRequest({
      authHeader: "Bearer valid-admin-token",
      body: { uid: "target-user" }, // missing claims
    });
    const res = await POST(req);

    // Then: response is 400 Bad Request
    expect(res.status).toBe(400);
  });
});
