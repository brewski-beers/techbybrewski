import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock global fetch before importing the route
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { POST } from "../route";

function makeRequest(fields: Record<string, string>): NextRequest {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    body: formData,
  });
}

const VALID_FIELDS = {
  name: "Jane Doe",
  email: "jane@example.com",
  problem: "I need a website.",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Firestore write succeeds
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Scenario: Missing required fields
  it("returns 400 when name is missing", async () => {
    // Given: form data is missing name
    const req = makeRequest({ email: VALID_FIELDS.email, problem: VALID_FIELDS.problem });

    // When: POST is sent
    const res = await POST(req);

    // Then: 400 with error message
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing required fields." });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    // Given: form data is missing email
    const req = makeRequest({ name: VALID_FIELDS.name, problem: VALID_FIELDS.problem });

    // When: POST is sent
    const res = await POST(req);

    // Then: 400 with error message
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing required fields." });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 400 when problem is missing", async () => {
    // Given: form data is missing problem
    const req = makeRequest({ name: VALID_FIELDS.name, email: VALID_FIELDS.email });

    // When: POST is sent
    const res = await POST(req);

    // Then: 400 with error message
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing required fields." });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Scenario: Empty trimmed fields treated as missing
  it("returns 400 when name is whitespace only", async () => {
    // Given: name is whitespace only
    const req = makeRequest({
      name: "   ",
      email: VALID_FIELDS.email,
      problem: VALID_FIELDS.problem,
    });

    // When: POST is sent
    const res = await POST(req);

    // Then: 400 — whitespace trims to empty string
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Missing required fields." });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Scenario: Valid submission
  it("creates a contactSubmissions document and returns { ok: true } with 200", async () => {
    // Given: complete form data and Firestore REST returns 200
    const req = makeRequest(VALID_FIELDS);

    // When: POST is sent
    const res = await POST(req);

    // Then: fetch was called once to Firestore REST endpoint
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("contactSubmissions");
    expect(init.method).toBe("POST");

    // And: body contains required fields
    const body = JSON.parse(init.body as string);
    expect(body.fields.name.stringValue).toBe("Jane Doe");
    expect(body.fields.email.stringValue).toBe("jane@example.com");
    expect(body.fields.problem.stringValue).toBe("I need a website.");

    // And: response is 200 { ok: true }
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
  });

  // Scenario: Firestore write failure
  it("returns 500 when Firestore REST endpoint returns an error", async () => {
    // Given: Firestore REST endpoint returns non-ok status
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "Service Unavailable",
    });

    // When: POST is sent with valid data
    const req = makeRequest(VALID_FIELDS);
    const res = await POST(req);

    // Then: 500 with error message
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toEqual({ error: "Failed to save submission." });
  });
});
