"use client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  SiteSettings,
  Service,
  CaseStudy,
  Testimonial,
  FAQ,
  ActivityLogEntry,
  BlogPost,
} from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────

function withId<T>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

// ── Site Settings ─────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snap = await getDoc(doc(db, "siteSettings", "main"));
  if (!snap.exists()) return null;
  return snap.data() as SiteSettings;
}

// ── Services ──────────────────────────────────────────────────

export async function getPublishedServices(): Promise<Service[]> {
  const q = query(
    collection(db, "services"),
    where("isPublished", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Service>(d.id, d.data()));
}

export async function getAllServices(): Promise<Service[]> {
  const q = query(collection(db, "services"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Service>(d.id, d.data()));
}

export async function getServiceById(id: string): Promise<Service | null> {
  const snap = await getDoc(doc(db, "services", id));
  if (!snap.exists()) return null;
  return withId<Service>(snap.id, snap.data());
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const q = query(
    collection(db, "services"),
    where("slug", "==", slug),
    where("isPublished", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return withId<Service>(d.id, d.data());
}

// ── Case Studies ──────────────────────────────────────────────

export async function getPublishedCaseStudies(constraints: QueryConstraint[] = []): Promise<CaseStudy[]> {
  const q = query(
    collection(db, "caseStudies"),
    where("isPublished", "==", true),
    orderBy("order", "asc"),
    ...constraints
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<CaseStudy>(d.id, d.data()));
}

export async function getFeaturedCaseStudies(max = 3): Promise<CaseStudy[]> {
  const q = query(
    collection(db, "caseStudies"),
    where("isPublished", "==", true),
    where("featured", "==", true),
    orderBy("order", "asc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<CaseStudy>(d.id, d.data()));
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const q = query(collection(db, "caseStudies"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<CaseStudy>(d.id, d.data()));
}

export async function getCaseStudyById(id: string): Promise<CaseStudy | null> {
  const snap = await getDoc(doc(db, "caseStudies", id));
  if (!snap.exists()) return null;
  return withId<CaseStudy>(snap.id, snap.data());
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const q = query(
    collection(db, "caseStudies"),
    where("slug", "==", slug),
    where("isPublished", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return withId<CaseStudy>(d.id, d.data());
}

// ── Testimonials ──────────────────────────────────────────────

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const q = query(
    collection(db, "testimonials"),
    where("isPublished", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Testimonial>(d.id, d.data()));
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const q = query(collection(db, "testimonials"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Testimonial>(d.id, d.data()));
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const snap = await getDoc(doc(db, "testimonials", id));
  if (!snap.exists()) return null;
  return withId<Testimonial>(snap.id, snap.data());
}

// ── FAQs ──────────────────────────────────────────────────────

export async function getPublishedFAQs(): Promise<FAQ[]> {
  const q = query(
    collection(db, "faqs"),
    where("isPublished", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<FAQ>(d.id, d.data()));
}

export async function getAllFAQs(): Promise<FAQ[]> {
  const q = query(collection(db, "faqs"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<FAQ>(d.id, d.data()));
}

export async function getFAQById(id: string): Promise<FAQ | null> {
  const snap = await getDoc(doc(db, "faqs", id));
  if (!snap.exists()) return null;
  return withId<FAQ>(snap.id, snap.data());
}

// ── Activity Log ──────────────────────────────────────────────

export async function getRecentActivity(max = 50): Promise<ActivityLogEntry[]> {
  const q = query(
    collection(db, "activityLog"),
    orderBy("timestamp", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ActivityLogEntry>(d.id, d.data()));
}

// ── Dashboard counts ──────────────────────────────────────────

export interface DashboardStats {
  services: { published: number; draft: number };
  caseStudies: { published: number; draft: number };
  testimonials: { published: number; draft: number };
  faqs: { published: number; draft: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [services, caseStudies, testimonials, faqs] = await Promise.all([
    getDocs(collection(db, "services")),
    getDocs(collection(db, "caseStudies")),
    getDocs(collection(db, "testimonials")),
    getDocs(collection(db, "faqs")),
  ]);

  function count(snap: typeof services) {
    let published = 0;
    let draft = 0;
    snap.forEach((d) => {
      if (d.data().isPublished) published++;
      else draft++;
    });
    return { published, draft };
  }

  return {
    services: count(services),
    caseStudies: count(caseStudies),
    testimonials: count(testimonials),
    faqs: count(faqs),
  };
}

// ── Blog Posts ─────────────────────────────────────────────────

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const q = query(
    collection(db, "blogPosts"),
    where("isPublished", "==", true),
    orderBy("publishedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<BlogPost>(d.id, d.data()));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, "blogPosts"),
    where("slug", "==", slug),
    where("isPublished", "==", true),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return withId<BlogPost>(d.id, d.data());
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<BlogPost>(d.id, d.data()));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, "blogPosts", id));
  if (!snap.exists()) return null;
  return withId<BlogPost>(snap.id, snap.data());
}
