import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockVerifyIdToken,
  mockCreateUser,
  mockSetCustomUserClaims,
  mockDeleteUser,
  mockSet,
} = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
  mockCreateUser: vi.fn(),
  mockSetCustomUserClaims: vi.fn(),
  mockDeleteUser: vi.fn(),
  mockSet: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  adminAuth: {
    verifyIdToken: mockVerifyIdToken,
    createUser: mockCreateUser,
    setCustomUserClaims: mockSetCustomUserClaims,
    deleteUser: mockDeleteUser,
  },
  adminDb: {
    doc: () => ({ set: mockSet }),
  },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    serverTimestamp: () => "__serverTimestamp__",
  },
}));

import { POST } from "../route";
import { NextRequest } from "next/server";

function makeRequest(opts: {
  authHeader?: string;
  body?: Record<string, unknown>;
}): NextRequest {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.authHeader) headers["authorization"] = opts.authHeader;
  return new NextRequest("http://localhost/api/admin/clients", {
    method: "POST",
    headers,
    body: JSON.stringify(opts.body ?? {}),
  });
}

const VALID_PAYLOAD = {
  email: "client@example.com",
  companyName: "Acme Corp",
  contactName: "Jane Doe",
};

describe("POST /api/admin/clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no auth token is provided", async () => {
    // Given: verifyIdToken throws (no token in header)
    mockVerifyIdToken.mockRejectedValueOnce(new Error("No token"));

    // When: request arrives without Authorization header
    const req = makeRequest({ body: VALID_PAYLOAD });
    const res = await POST(req);

    // Then: response is 401 and no Auth user is created
    expect(res.status).toBe(401);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("returns 403 when authenticated but caller is not an admin", async () => {
    // Given: token is valid but caller has no admin claim
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "regular-user", admin: false });

    // When: non-admin posts the request
    const req = makeRequest({
      authHeader: "Bearer non-admin-token",
      body: VALID_PAYLOAD,
    });
    const res = await POST(req);

    // Then: response is 403 Forbidden and no Auth user is created
    expect(res.status).toBe(403);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("returns 201 with uid when admin creates a client successfully", async () => {
    // Given: valid admin token and Firestore write succeeds
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "admin-1", admin: true });
    mockCreateUser.mockResolvedValueOnce({ uid: "new-client-uid" });
    mockSetCustomUserClaims.mockResolvedValueOnce(undefined);
    mockSet.mockResolvedValueOnce(undefined);

    // When: admin posts a complete client payload
    const req = makeRequest({
      authHeader: "Bearer admin-token",
      body: VALID_PAYLOAD,
    });
    const res = await POST(req);

    // Then: response is 201 with the new uid
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.uid).toBe("new-client-uid");
    expect(json.email).toBe(VALID_PAYLOAD.email);
  });

  it("returns 500 and does NOT roll back Auth user when Firestore write fails (orphan path — documents missing rollback)", async () => {
    // Given: Auth user creation succeeds but Firestore write fails
    // This test documents the orphan risk: the Auth user is left behind.
    mockVerifyIdToken.mockResolvedValueOnce({ uid: "admin-1", admin: true });
    mockCreateUser.mockResolvedValueOnce({ uid: "orphan-uid" });
    mockSetCustomUserClaims.mockResolvedValueOnce(undefined);
    mockSet.mockRejectedValueOnce(new Error("Firestore unavailable"));

    // When: admin posts a valid payload but Firestore is down
    const req = makeRequest({
      authHeader: "Bearer admin-token",
      body: VALID_PAYLOAD,
    });
    const res = await POST(req);

    // Then: response is 500
    expect(res.status).toBe(500);

    // And: deleteUser is NOT called — the Auth user is orphaned.
    // When rollback is added to the route, flip this assertion to:
    //   expect(mockDeleteUser).toHaveBeenCalledWith("orphan-uid");
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});
