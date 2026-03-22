import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

const mockUnsubscribe = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db: unknown, ...segments: string[]) => ({ _segments: segments })),
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ _col: col, _id: id })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn((...args: unknown[]) => args),
  orderBy: vi.fn((...args: unknown[]) => ({ _orderBy: args })),
  onSnapshot: vi.fn(),
}));

import { getDocs, getDoc, onSnapshot } from "firebase/firestore";

import {
  getAllClients,
  getClient,
  getClientContracts,
  getClientInvoices,
  getClientDocuments,
  subscribeToMessages,
} from "@/lib/firestore/portalQueries";

// ── Helpers ───────────────────────────────────────────────────

function makeDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

function makeSnap(docs: ReturnType<typeof makeDoc>[]) {
  return { docs };
}

// ── Tests ─────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Clients ───────────────────────────────────────────────────

describe("Scenario: Fetch all clients (admin)", () => {
  it("returns all client documents with id merged in", async () => {
    const docs = [
      makeDoc("uid-1", { companyName: "Acme", status: "active" }),
      makeDoc("uid-2", { companyName: "Globex", status: "paused" }),
    ];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(docs));

    const clients = await getAllClients();
    expect(clients).toHaveLength(2);
    expect(clients[0].id).toBe("uid-1");
    expect(clients[0].companyName).toBe("Acme");
    expect(clients[1].id).toBe("uid-2");
  });
});

describe("Scenario: Fetch a single client by uid", () => {
  it("returns the client when the document exists", async () => {
    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      id: "uid-1",
      data: () => ({ companyName: "Acme", status: "active" }),
    });

    const client = await getClient("uid-1");
    expect(client).not.toBeNull();
    expect(client?.id).toBe("uid-1");
    expect(client?.companyName).toBe("Acme");
  });

  it("returns null when the client document does not exist", async () => {
    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({ exists: () => false });
    const client = await getClient("uid-missing");
    expect(client).toBeNull();
  });
});

// ── Subcollections ────────────────────────────────────────────

describe("Scenario: Fetch client invoices — only that client's data is returned", () => {
  it("returns invoices scoped to the given client uid", async () => {
    const invoiceDocs = [
      makeDoc("inv-1", { amountCents: 50000, status: "paid" }),
      makeDoc("inv-2", { amountCents: 75000, status: "pending" }),
    ];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(invoiceDocs));

    const invoices = await getClientInvoices("uid-1");
    expect(invoices).toHaveLength(2);
    expect(invoices[0].id).toBe("inv-1");
    expect(invoices[1].amountCents).toBe(75000);
  });

  it("returns an empty array when the client has no invoices", async () => {
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([]));
    const invoices = await getClientInvoices("uid-1");
    expect(invoices).toEqual([]);
  });
});

describe("Scenario: Fetch client contracts — only that client's data is returned", () => {
  it("returns contracts scoped to the given client uid", async () => {
    const contractDocs = [
      makeDoc("con-1", { name: "MSA", signatureStatus: "signed" }),
    ];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(contractDocs));

    const contracts = await getClientContracts("uid-1");
    expect(contracts).toHaveLength(1);
    expect(contracts[0].id).toBe("con-1");
    expect(contracts[0].name).toBe("MSA");
  });
});

describe("Scenario: Fetch client documents by category", () => {
  it("returns documents for the specified category", async () => {
    const docs = [makeDoc("doc-1", { name: "Logo.png", uploadedBy: "admin" })];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(docs));

    const result = await getClientDocuments("uid-1", "assets");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Logo.png");
  });
});

// ── Real-time messages ─────────────────────────────────────────

describe("Scenario: Subscribe to client messages", () => {
  it("calls onSnapshot and returns an unsubscribe function", () => {
    (onSnapshot as ReturnType<typeof vi.fn>).mockReturnValue(mockUnsubscribe);

    const callback = vi.fn();
    const unsubscribe = subscribeToMessages("uid-1", callback);

    expect(onSnapshot).toHaveBeenCalledTimes(1);
    expect(typeof unsubscribe).toBe("function");
  });

  it("invokes the callback with mapped messages when snapshot fires", () => {
    const messageDocs = [
      makeDoc("msg-1", { body: "Hello", senderRole: "client", isRead: false }),
    ];
    (onSnapshot as ReturnType<typeof vi.fn>).mockImplementation(
      (_query: unknown, cb: (snap: { docs: typeof messageDocs }) => void) => {
        cb({ docs: messageDocs });
        return mockUnsubscribe;
      }
    );

    const callback = vi.fn();
    subscribeToMessages("uid-1", callback);

    expect(callback).toHaveBeenCalledTimes(1);
    const [messages] = callback.mock.calls[0];
    expect(messages).toHaveLength(1);
    expect(messages[0].body).toBe("Hello");
  });
});
