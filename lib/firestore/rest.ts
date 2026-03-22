/**
 * Server-side Firestore helpers using the Firebase Admin SDK.
 * Replaces the former REST API implementation.
 *
 * In dev: set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 — the Admin SDK
 * automatically routes all calls to the local emulator.
 * In production (Firebase App Hosting): Application Default Credentials
 * are used automatically; no env var needed.
 *
 * DO NOT add "use client" — this file is server-only.
 */

import { adminDb } from "@/lib/firebase-admin";
import { Service, CaseStudy, CaseStudyImage, Testimonial, SiteSettings, FAQ } from "@/lib/types";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

// ── Timestamp stripping ────────────────────────────────────────
// Admin SDK returns FirebaseFirestore.Timestamp objects. We drop them
// (return null) to match prior REST behavior — public pages don't display them.

// ── Shape helpers ──────────────────────────────────────────────

function toService(id: string, d: DocumentData): Service {
  return {
    id,
    name: (d.name as string) ?? "",
    slug: (d.slug as string) ?? "",
    summary: (d.summary as string) ?? "",
    imageUrl: (d.imageUrl as string) ?? "",
    bullets: (d.bullets as string[]) ?? [],
    useCases: (d.useCases as string[]) ?? [],
    order: (d.order as number) ?? 0,
    isActive: (d.isActive as boolean) ?? false,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}

function toCaseStudy(id: string, d: DocumentData): CaseStudy {
  const rawImages = (d.images as Array<Record<string, unknown>>) ?? [];
  const images: CaseStudyImage[] = rawImages.map((img) => ({
    url: (img.url as string) ?? "",
    alt: (img.alt as string) ?? "",
    order: (img.order as number) ?? 0,
  }));
  return {
    id,
    title: (d.title as string) ?? "",
    slug: (d.slug as string) ?? "",
    clientName: (d.clientName as string) ?? "",
    industry: (d.industry as string) ?? "",
    overview: (d.overview as string) ?? "",
    problem: (d.problem as string[]) ?? [],
    solution: (d.solution as string[]) ?? [],
    outcomes: (d.outcomes as string[]) ?? [],
    stack: (d.stack as string[]) ?? [],
    images,
    featured: (d.featured as boolean) ?? false,
    order: (d.order as number) ?? 0,
    publishedAt: null,
    updatedAt: null,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}

function toTestimonial(id: string, d: DocumentData): Testimonial {
  return {
    id,
    quote: (d.quote as string) ?? "",
    name: (d.name as string) ?? "",
    title: (d.title as string) ?? "",
    company: (d.company as string) ?? "",
    avatarUrl: (d.avatarUrl as string) ?? "",
    order: (d.order as number) ?? 0,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}

// ── Public query helpers ───────────────────────────────────────

export async function getSiteSettingsRest(): Promise<SiteSettings | null> {
  const snap = await adminDb.collection("siteSettings").doc("main").get();
  if (!snap.exists) return null;
  const d = snap.data() as DocumentData;
  const socialLinks = (d.socialLinks as Record<string, unknown>) ?? {};
  const seoDefaults = (d.seoDefaults as Record<string, unknown>) ?? {};
  return {
    brandName: (d.brandName as string) ?? "",
    tagline: (d.tagline as string) ?? "",
    heroHeadline: (d.heroHeadline as string) ?? "",
    heroSubheadline: (d.heroSubheadline as string) ?? "",
    primaryCTAType: ((d.primaryCTAType as string) ?? "contact") as "calendly" | "contact",
    calendlyUrl: (d.calendlyUrl as string) ?? "",
    contactEmail: (d.contactEmail as string) ?? "",
    socialLinks: {
      linkedin: (socialLinks.linkedin as string) ?? "",
      github: (socialLinks.github as string) ?? "",
      instagram: (socialLinks.instagram as string) ?? "",
    },
    seoDefaults: {
      titleTemplate: (seoDefaults.titleTemplate as string) ?? "",
      defaultDescription: (seoDefaults.defaultDescription as string) ?? "",
    },
  };
}

export async function getPublishedServicesRest(): Promise<Service[]> {
  const snap = await adminDb
    .collection("services")
    .where("isPublished", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toService(doc.id, doc.data()));
}

export async function getFeaturedCaseStudiesRest(max = 3): Promise<CaseStudy[]> {
  const snap = await adminDb
    .collection("caseStudies")
    .where("isPublished", "==", true)
    .where("featured", "==", true)
    .orderBy("order", "asc")
    .limit(max)
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toCaseStudy(doc.id, doc.data()));
}

export async function getPublishedCaseStudiesRest(): Promise<CaseStudy[]> {
  const snap = await adminDb
    .collection("caseStudies")
    .where("isPublished", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toCaseStudy(doc.id, doc.data()));
}

export async function getPublishedTestimonialsRest(): Promise<Testimonial[]> {
  const snap = await adminDb
    .collection("testimonials")
    .where("isPublished", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toTestimonial(doc.id, doc.data()));
}

export async function getPublishedServiceSlugs(): Promise<string[]> {
  const snap = await adminDb
    .collection("services")
    .where("isPublished", "==", true)
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => doc.data().slug as string).filter(Boolean);
}

export async function getServiceBySlugRest(slug: string): Promise<Service | null> {
  const snap = await adminDb
    .collection("services")
    .where("isPublished", "==", true)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toService(doc.id, doc.data());
}

export async function getPublishedCaseStudySlugs(): Promise<string[]> {
  const snap = await adminDb
    .collection("caseStudies")
    .where("isPublished", "==", true)
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => doc.data().slug as string).filter(Boolean);
}

export async function getCaseStudyBySlugRest(slug: string): Promise<CaseStudy | null> {
  const snap = await adminDb
    .collection("caseStudies")
    .where("isPublished", "==", true)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toCaseStudy(doc.id, doc.data());
}

function toFAQ(id: string, d: DocumentData): FAQ {
  return {
    id,
    question: (d.question as string) ?? "",
    answer: (d.answer as string) ?? "",
    category: (d.category as string) ?? "",
    order: (d.order as number) ?? 0,
    isPublished: (d.isPublished as boolean) ?? false,
  };
}

export async function getPublishedFAQsRest(): Promise<FAQ[]> {
  const snap = await adminDb
    .collection("faqs")
    .where("isPublished", "==", true)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toFAQ(doc.id, doc.data()));
}
