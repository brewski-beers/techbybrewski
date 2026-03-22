import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db: unknown, col: string) => ({ _col: col })),
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ _col: col, _id: id })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  query: vi.fn((...args: unknown[]) => args),
  where: vi.fn((...args: unknown[]) => ({ _where: args })),
  orderBy: vi.fn((...args: unknown[]) => ({ _orderBy: args })),
  limit: vi.fn((n: number) => ({ _limit: n })),
}));

import { getDocs, getDoc } from "firebase/firestore";

import {
  getPublishedServices,
  getAllServices,
  getServiceById,
  getPublishedCaseStudies,
  getPublishedTestimonials,
  getPublishedFAQs,
  getAllFAQs,
  getDashboardStats,
} from "@/lib/firestore/queries";

// ── Helpers ───────────────────────────────────────────────────

function makeDoc(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

function makeSnap(docs: ReturnType<typeof makeDoc>[]) {
  return { docs, forEach: (fn: (d: (typeof docs)[0]) => void) => docs.forEach(fn) };
}

// ── Tests ─────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Services ──────────────────────────────────────────────────

describe("Scenario: Fetch published services", () => {
  it("returns only published documents with correct shape", async () => {
    const publishedDoc = makeDoc("svc-1", {
      name: "Web Dev",
      slug: "web-dev",
      isPublished: true,
      order: 0,
    });
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([publishedDoc]));

    const results = await getPublishedServices();

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("svc-1");
    expect(results[0].isPublished).toBe(true);
  });

  it("returns an empty array when no published services exist", async () => {
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([]));
    const results = await getPublishedServices();
    expect(results).toEqual([]);
  });
});

describe("Scenario: Fetch all services (admin)", () => {
  it("returns all documents regardless of publish state", async () => {
    const docs = [
      makeDoc("svc-1", { name: "Web Dev", isPublished: true, order: 0 }),
      makeDoc("svc-2", { name: "SEO", isPublished: false, order: 1 }),
    ];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(docs));

    const results = await getAllServices();
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.id)).toEqual(["svc-1", "svc-2"]);
  });
});

describe("Scenario: Fetch a single service by id", () => {
  it("returns the service when the document exists", async () => {
    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => true,
      id: "svc-1",
      data: () => ({ name: "Web Dev", isPublished: true }),
    });

    const result = await getServiceById("svc-1");
    expect(result).not.toBeNull();
    expect(result?.id).toBe("svc-1");
    expect(result?.name).toBe("Web Dev");
  });

  it("returns null when the document does not exist", async () => {
    (getDoc as ReturnType<typeof vi.fn>).mockResolvedValue({
      exists: () => false,
    });

    const result = await getServiceById("missing");
    expect(result).toBeNull();
  });
});

// ── Case Studies ──────────────────────────────────────────────

describe("Scenario: Fetch published case studies", () => {
  it("returns published case studies with correct shape", async () => {
    const doc = makeDoc("cs-1", {
      title: "Acme Redesign",
      isPublished: true,
      order: 0,
    });
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([doc]));

    const results = await getPublishedCaseStudies();
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("cs-1");
  });
});

// ── Testimonials ──────────────────────────────────────────────

describe("Scenario: Fetch published testimonials", () => {
  it("returns published testimonials", async () => {
    const doc = makeDoc("t-1", { name: "Jane Doe", isPublished: true, order: 0 });
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([doc]));

    const results = await getPublishedTestimonials();
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Jane Doe");
  });
});

// ── FAQs ──────────────────────────────────────────────────────

describe("Scenario: Fetch published FAQs", () => {
  it("returns only published FAQs", async () => {
    const doc = makeDoc("faq-1", { question: "What?", isPublished: true, order: 0 });
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap([doc]));

    const results = await getPublishedFAQs();
    expect(results).toHaveLength(1);
    expect(results[0].question).toBe("What?");
  });
});

describe("Scenario: Fetch all FAQs (admin)", () => {
  it("returns all FAQs regardless of publish state", async () => {
    const docs = [
      makeDoc("faq-1", { question: "Q1?", isPublished: true, order: 0 }),
      makeDoc("faq-2", { question: "Q2?", isPublished: false, order: 1 }),
    ];
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(makeSnap(docs));

    const results = await getAllFAQs();
    expect(results).toHaveLength(2);
  });
});

// ── Dashboard stats ───────────────────────────────────────────

describe("Scenario: Get dashboard stats", () => {
  it("counts published and draft docs per collection", async () => {
    const mockSnap = makeSnap([
      makeDoc("a", { isPublished: true }),
      makeDoc("b", { isPublished: false }),
    ]);
    (getDocs as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnap);

    const stats = await getDashboardStats();

    expect(stats.services.published).toBe(1);
    expect(stats.services.draft).toBe(1);
    expect(stats.caseStudies.published).toBe(1);
    expect(stats.faqs.draft).toBe(1);
  });
});
