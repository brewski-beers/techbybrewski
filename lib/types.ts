// Compatible with firebase/firestore Timestamp — no SDK import needed
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

// ── Site Settings ─────────────────────────────────────────────
export interface SiteSettings {
  brandName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCTAType: "calendly" | "contact";
  calendlyUrl: string;
  contactEmail: string;
  socialLinks: {
    linkedin: string;
    github: string;
    instagram: string;
  };
  seoDefaults: {
    titleTemplate: string;
    defaultDescription: string;
  };
}

// ── Service ───────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string;
  bullets: string[];
  useCases: string[];
  order: number;
  isActive: boolean;
  isPublished: boolean;
}

// ── Case Study ────────────────────────────────────────────────
export interface CaseStudyImage {
  url: string;
  alt: string;
  order: number;
}

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  overview: string;
  problem: string[];
  solution: string[];
  outcomes: string[];
  stack: string[];
  images: CaseStudyImage[];
  featured: boolean;
  order: number;
  publishedAt: FirestoreTimestamp | null;
  updatedAt: FirestoreTimestamp | null;
  isPublished: boolean;
}

// ── Testimonial ───────────────────────────────────────────────
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  order: number;
  isPublished: boolean;
}

// ── FAQ ───────────────────────────────────────────────────────
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
}

// ── Activity Log ──────────────────────────────────────────────
export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "DELETE";

export interface ActivityLogEntry {
  id: string;
  action: ActivityAction;
  collection: string;
  docId: string;
  actorEmail: string;
  timestamp: FirestoreTimestamp;
  changesSummary: string;
}

// ── Form types (Omit id + FirestoreTimestamps for create/update forms) ─
export type ServiceFormData = Omit<Service, "id">;
export type CaseStudyFormData = Omit<CaseStudy, "id" | "publishedAt" | "updatedAt">;
export type TestimonialFormData = Omit<Testimonial, "id">;
export type FAQFormData = Omit<FAQ, "id">;
