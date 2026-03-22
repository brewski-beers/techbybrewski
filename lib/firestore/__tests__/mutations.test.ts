import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: { currentUser: { email: "test@example.com" } },
}));

const mockBatch = {
  update: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((_db: unknown, col: string) => ({ _col: col })),
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ _col: col, _id: id })),
  addDoc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  deleteDoc: vi.fn().mockResolvedValue(undefined),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  writeBatch: vi.fn(() => mockBatch),
}));

import {
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

import {
  createService,
  updateService,
  deleteService,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  saveSiteSettings,
  reorderServices,
} from "@/lib/firestore/mutations";

import type {
  ServiceFormData,
  CaseStudyFormData,
  TestimonialFormData,
  FAQFormData,
  SiteSettings,
} from "@/lib/types";

// ── Fixtures ──────────────────────────────────────────────────

const serviceData: ServiceFormData = {
  name: "Web Development",
  slug: "web-development",
  summary: "Custom websites",
  imageUrl: "https://example.com/img.png",
  bullets: ["Fast", "Accessible"],
  useCases: ["Startups"],
  order: 1,
  isActive: true,
  isPublished: false,
};

const caseStudyData: CaseStudyFormData = {
  title: "Acme Redesign",
  slug: "acme-redesign",
  clientName: "Acme Corp",
  industry: "Retail",
  overview: "Full redesign",
  problem: ["Slow site"],
  solution: ["New stack"],
  outcomes: ["3x traffic"],
  stack: ["Next.js"],
  images: [],
  featured: false,
  order: 1,
  isPublished: false,
};

const testimonialData: TestimonialFormData = {
  quote: "Great work!",
  name: "Jane Doe",
  title: "CEO",
  company: "Acme",
  avatarUrl: "",
  order: 1,
  isPublished: true,
};

const faqData: FAQFormData = {
  question: "What do you charge?",
  answer: "Depends on scope.",
  category: "pricing",
  order: 1,
  isPublished: true,
};

const siteSettings: SiteSettings = {
  brandName: "TechByBrewski",
  tagline: "Code. Coffee. Ship.",
  heroHeadline: "Build great products",
  heroSubheadline: "With expert help",
  primaryCTAType: "calendly",
  calendlyUrl: "https://calendly.com/kb",
  contactEmail: "kb@example.com",
  socialLinks: { linkedin: "", github: "", instagram: "" },
  seoDefaults: {
    titleTemplate: "%s | TechByBrewski",
    defaultDescription: "Agency",
  },
};

// ── Tests ─────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  (addDoc as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "doc-123" });
  mockBatch.update.mockReset();
  mockBatch.commit.mockReset().mockResolvedValue(undefined);
});

// ── Services ──────────────────────────────────────────────────

describe("Scenario: Create a service", () => {
  it("adds a document to the services collection and returns its id", async () => {
    const id = await createService(serviceData);
    expect(addDoc).toHaveBeenCalled();
    expect(id).toBe("doc-123");
  });

  it("also logs the create action to activityLog", async () => {
    await createService(serviceData);
    // addDoc called twice: once for doc, once for activity log
    expect(addDoc).toHaveBeenCalledTimes(2);
  });
});

describe("Scenario: Update a service", () => {
  it("calls updateDoc with the partial data", async () => {
    await updateService("svc-1", { name: "Updated Name" });
    // one doc update; activity log uses addDoc
    expect(updateDoc).toHaveBeenCalledTimes(1);
    const [, payload] = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload).toMatchObject({ name: "Updated Name" });
  });
});

describe("Scenario: Delete a document (service)", () => {
  it("calls deleteDoc for the service and logs the action", async () => {
    await deleteService("svc-1", "Web Development");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledTimes(1); // activity log
  });
});

// ── Case Studies ──────────────────────────────────────────────

describe("Scenario: Create a case study", () => {
  it("adds a document with updatedAt set to serverTimestamp", async () => {
    const id = await createCaseStudy(caseStudyData);
    expect(id).toBe("doc-123");
    const [, payload] = (addDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.updatedAt).toBe("SERVER_TIMESTAMP");
    expect(payload.publishedAt).toBeNull();
  });
});

describe("Scenario: Update a case study — updatedAt is set", () => {
  it("includes updatedAt: serverTimestamp() in the update payload", async () => {
    await updateCaseStudy("cs-1", { title: "New Title" });
    const [, payload] = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload.updatedAt).toBe("SERVER_TIMESTAMP");
    expect(payload.title).toBe("New Title");
  });
});

describe("Scenario: Delete a case study", () => {
  it("calls deleteDoc once for the document", async () => {
    await deleteCaseStudy("cs-1", "Acme Redesign");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

// ── Testimonials ──────────────────────────────────────────────

describe("Scenario: Create a testimonial", () => {
  it("returns the new document id", async () => {
    const id = await createTestimonial(testimonialData);
    expect(id).toBe("doc-123");
  });
});

describe("Scenario: Update a testimonial", () => {
  it("calls updateDoc with partial data", async () => {
    await updateTestimonial("t-1", { quote: "Revised quote" });
    expect(updateDoc).toHaveBeenCalled();
    const [, payload] = (updateDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload).toMatchObject({ quote: "Revised quote" });
  });
});

describe("Scenario: Delete a testimonial", () => {
  it("calls deleteDoc once", async () => {
    await deleteTestimonial("t-1", "Jane Doe");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

// ── FAQs ──────────────────────────────────────────────────────

describe("Scenario: Create a FAQ", () => {
  it("returns the new document id", async () => {
    const id = await createFAQ(faqData);
    expect(id).toBe("doc-123");
  });
});

describe("Scenario: Update a FAQ", () => {
  it("calls updateDoc with partial data", async () => {
    await updateFAQ("faq-1", { answer: "Updated answer" });
    expect(updateDoc).toHaveBeenCalled();
  });
});

describe("Scenario: Delete a FAQ", () => {
  it("calls deleteDoc once", async () => {
    await deleteFAQ("faq-1", "What do you charge?");
    expect(deleteDoc).toHaveBeenCalledTimes(1);
  });
});

// ── Site Settings ─────────────────────────────────────────────

describe("Scenario: Save site settings", () => {
  it("calls setDoc with the settings data", async () => {
    await saveSiteSettings(siteSettings);
    expect(setDoc).toHaveBeenCalledTimes(1);
    const [, payload] = (setDoc as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload).toMatchObject({ brandName: "TechByBrewski" });
  });
});

// ── Batch reorder ─────────────────────────────────────────────

describe("Scenario: Reorder services (batch)", () => {
  it("calls batch.update for each item and then batch.commit", async () => {
    await reorderServices([
      { id: "svc-1", order: 0 },
      { id: "svc-2", order: 1 },
    ]);
    expect(mockBatch.update).toHaveBeenCalledTimes(2);
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });
});
