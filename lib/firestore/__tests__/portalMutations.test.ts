import { vi, describe, it, expect, beforeEach } from "vitest";

// ── Hoisted mocks (available inside vi.mock factories) ────────────────────────

const {
  mockAddDoc,
  mockUpdateDoc,
  mockDeleteDoc,
  mockCollection,
  mockDoc,
  mockServerTimestamp,
  mockTimestampFromDate,
  mockAuth,
} = vi.hoisted(() => {
  const mockAuth = {
    currentUser: null as null | {
      email: string;
      getIdTokenResult: () => Promise<{ claims: Record<string, unknown> }>;
    },
  };
  return {
    mockAddDoc: vi.fn(),
    mockUpdateDoc: vi.fn(),
    mockDeleteDoc: vi.fn(),
    mockCollection: vi.fn((...args: unknown[]) => args.join("/")),
    mockDoc: vi.fn((...args: unknown[]) => args.join("/")),
    mockServerTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
    mockTimestampFromDate: vi.fn((d: Date) => ({ _kind: "Timestamp", date: d })),
    mockAuth,
  };
});

vi.mock("firebase/firestore", () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
  Timestamp: { fromDate: (d: Date) => mockTimestampFromDate(d) },
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: mockAuth,
}));

import {
  createInvoice,
  updateInvoiceStatus,
  sendMessage,
  markMessageRead,
  addClientDocument,
  deleteClientDocument,
  updateContractSignature,
} from "../portalMutations";

function makeUser(isAdmin: boolean) {
  return {
    email: isAdmin ? "admin@test.com" : "client@test.com",
    getIdTokenResult: async () => ({
      claims: isAdmin ? { admin: true } : {},
    }),
  };
}

describe("createInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: "invoice-123" });
  });

  it("adds doc to clients/{uid}/invoices with status 'draft' and converts dueDate", async () => {
    const dueDate = new Date("2026-04-01");
    await createInvoice("client-uid", {
      type: "one-time",
      amountCents: 5000,
      currency: "USD",
      description: "Test invoice",
      dueDate,
    });
    expect(mockAddDoc).toHaveBeenCalledOnce();
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.status).toBe("draft");
    expect(payload.createdAt).toBe("SERVER_TIMESTAMP");
    expect(mockTimestampFromDate).toHaveBeenCalledWith(dueDate);
  });

  it("returns the document ID", async () => {
    const id = await createInvoice("client-uid", {
      type: "one-time",
      amountCents: 1000,
      currency: "USD",
      description: "Test",
      dueDate: null,
    });
    expect(id).toBe("invoice-123");
  });

  it("passes null dueDate without calling Timestamp.fromDate", async () => {
    await createInvoice("client-uid", {
      type: "one-time",
      amountCents: 1000,
      currency: "USD",
      description: "No due date",
      dueDate: null,
    });
    expect(mockTimestampFromDate).not.toHaveBeenCalled();
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.dueDate).toBeNull();
  });
});

describe("updateInvoiceStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it("calls updateDoc with the given status", async () => {
    await updateInvoiceStatus("client-uid", "invoice-id", "paid");
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const [, payload] = mockUpdateDoc.mock.calls[0];
    expect(payload).toEqual({ status: "paid" });
  });
});

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: "msg-123" });
  });

  it("throws 'Not authenticated' when no user is signed in", async () => {
    mockAuth.currentUser = null;
    await expect(sendMessage("client-uid", "hello")).rejects.toThrow("Not authenticated");
  });

  it("sets senderRole to 'admin' when user has admin claim", async () => {
    mockAuth.currentUser = makeUser(true);
    await sendMessage("client-uid", "hello from admin");
    expect(mockAddDoc).toHaveBeenCalledOnce();
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.senderRole).toBe("admin");
  });

  it("sets senderRole to 'client' when user lacks admin claim", async () => {
    mockAuth.currentUser = makeUser(false);
    await sendMessage("client-uid", "hello from client");
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.senderRole).toBe("client");
  });

  it("writes isRead: false, body, attachmentUrls, and createdAt", async () => {
    mockAuth.currentUser = makeUser(false);
    await sendMessage("client-uid", "test body", ["url1"]);
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.isRead).toBe(false);
    expect(payload.body).toBe("test body");
    expect(payload.attachmentUrls).toEqual(["url1"]);
    expect(payload.createdAt).toBe("SERVER_TIMESTAMP");
  });
});

describe("markMessageRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it("calls updateDoc with { isRead: true }", async () => {
    await markMessageRead("client-uid", "msg-id");
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const [, payload] = mockUpdateDoc.mock.calls[0];
    expect(payload).toEqual({ isRead: true });
  });
});

describe("addClientDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: "doc-123" });
  });

  const baseData = {
    name: "Contract A",
    fileName: "contract-a.pdf",
    fileUrl: "https://example.com/contract-a.pdf",
    storagePath: "clients/client-uid/contracts/contract-a.pdf",
    fileType: "application/pdf",
    fileSizeBytes: 12345,
  };

  it("adds signatureStatus: 'none' for contracts category", async () => {
    await addClientDocument("client-uid", "contracts", { ...baseData, signatureUrl: null });
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.signatureStatus).toBe("none");
    expect(payload.signatureUrl).toBeNull();
  });

  it("does not add signatureStatus for deliverables category", async () => {
    await addClientDocument("client-uid", "deliverables", baseData);
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload).not.toHaveProperty("signatureStatus");
  });

  it("returns the document ID", async () => {
    const id = await addClientDocument("client-uid", "files", baseData);
    expect(id).toBe("doc-123");
  });

  it("defaults uploadedBy to 'admin' when not provided", async () => {
    await addClientDocument("client-uid", "assets", baseData);
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload.uploadedBy).toBe("admin");
  });
});

describe("deleteClientDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  it("calls deleteDoc once for the given path", async () => {
    await deleteClientDocument("client-uid", "contracts", "doc-id");
    expect(mockDeleteDoc).toHaveBeenCalledOnce();
  });
});

describe("updateContractSignature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDoc.mockResolvedValue(undefined);
  });

  it("updates signatureUrl, signatureStatus, and updatedAt", async () => {
    await updateContractSignature("client-uid", "contract-id", "https://sig.example.com", "pending");
    expect(mockUpdateDoc).toHaveBeenCalledOnce();
    const [, payload] = mockUpdateDoc.mock.calls[0];
    expect(payload.signatureUrl).toBe("https://sig.example.com");
    expect(payload.signatureStatus).toBe("pending");
    expect(payload.updatedAt).toBe("SERVER_TIMESTAMP");
  });

  it("accepts null signatureUrl", async () => {
    await updateContractSignature("client-uid", "contract-id", null, "none");
    const [, payload] = mockUpdateDoc.mock.calls[0];
    expect(payload.signatureUrl).toBeNull();
    expect(payload.signatureStatus).toBe("none");
  });
});
