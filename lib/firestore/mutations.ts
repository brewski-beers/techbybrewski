"use client";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type {
  SiteSettings,
  ServiceFormData,
  CaseStudyFormData,
  TestimonialFormData,
  FAQFormData,
  ActivityAction,
  BlogPostFormData,
} from "@/lib/types";

// ── Activity Log ──────────────────────────────────────────────

async function log(
  action: ActivityAction,
  col: string,
  docId: string,
  changesSummary: string
) {
  const actorEmail = auth.currentUser?.email ?? "unknown";
  await addDoc(collection(db, "activityLog"), {
    action,
    collection: col,
    docId,
    actorEmail,
    timestamp: serverTimestamp(),
    changesSummary,
  });
}

// ── Site Settings ─────────────────────────────────────────────

export async function saveSiteSettings(data: SiteSettings): Promise<void> {
  await setDoc(doc(db, "siteSettings", "main"), data);
  await log("UPDATE", "siteSettings", "main", "Updated site settings");
}

// ── Services ──────────────────────────────────────────────────

export async function createService(data: ServiceFormData): Promise<string> {
  const ref = await addDoc(collection(db, "services"), data);
  await log("CREATE", "services", ref.id, `Created service: ${data.name}`);
  return ref.id;
}

export async function updateService(id: string, data: Partial<ServiceFormData>): Promise<void> {
  await updateDoc(doc(db, "services", id), data);
  await log("UPDATE", "services", id, `Updated service: ${data.name ?? id}`);
}

export async function publishService(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "services", id), { isPublished: true });
  await log("PUBLISH", "services", id, `Published service: ${name}`);
}

export async function unpublishService(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "services", id), { isPublished: false });
  await log("UNPUBLISH", "services", id, `Unpublished service: ${name}`);
}

export async function deleteService(id: string, name: string): Promise<void> {
  await deleteDoc(doc(db, "services", id));
  await log("DELETE", "services", id, `Deleted service: ${name}`);
}

// ── Case Studies ──────────────────────────────────────────────

export async function createCaseStudy(data: CaseStudyFormData): Promise<string> {
  const ref = await addDoc(collection(db, "caseStudies"), {
    ...data,
    publishedAt: null,
    updatedAt: serverTimestamp(),
  });
  await log("CREATE", "caseStudies", ref.id, `Created case study: ${data.title}`);
  return ref.id;
}

export async function updateCaseStudy(id: string, data: Partial<CaseStudyFormData>): Promise<void> {
  await updateDoc(doc(db, "caseStudies", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await log("UPDATE", "caseStudies", id, `Updated case study: ${data.title ?? id}`);
}

export async function publishCaseStudy(id: string, title: string, wasPublished: boolean): Promise<void> {
  await updateDoc(doc(db, "caseStudies", id), {
    isPublished: true,
    updatedAt: serverTimestamp(),
    ...(wasPublished ? {} : { publishedAt: serverTimestamp() }),
  });
  await log("PUBLISH", "caseStudies", id, `Published case study: ${title}`);
}

export async function unpublishCaseStudy(id: string, title: string): Promise<void> {
  await updateDoc(doc(db, "caseStudies", id), {
    isPublished: false,
    updatedAt: serverTimestamp(),
  });
  await log("UNPUBLISH", "caseStudies", id, `Unpublished case study: ${title}`);
}

export async function deleteCaseStudy(id: string, title: string): Promise<void> {
  await deleteDoc(doc(db, "caseStudies", id));
  await log("DELETE", "caseStudies", id, `Deleted case study: ${title}`);
}

// ── Testimonials ──────────────────────────────────────────────

export async function createTestimonial(data: TestimonialFormData): Promise<string> {
  const ref = await addDoc(collection(db, "testimonials"), data);
  await log("CREATE", "testimonials", ref.id, `Created testimonial from: ${data.name}`);
  return ref.id;
}

export async function updateTestimonial(id: string, data: Partial<TestimonialFormData>): Promise<void> {
  await updateDoc(doc(db, "testimonials", id), data);
  await log("UPDATE", "testimonials", id, `Updated testimonial: ${data.name ?? id}`);
}

export async function deleteTestimonial(id: string, name: string): Promise<void> {
  await deleteDoc(doc(db, "testimonials", id));
  await log("DELETE", "testimonials", id, `Deleted testimonial from: ${name}`);
}

// ── FAQs ──────────────────────────────────────────────────────

export async function createFAQ(data: FAQFormData): Promise<string> {
  const ref = await addDoc(collection(db, "faqs"), data);
  await log("CREATE", "faqs", ref.id, `Created FAQ: ${data.question}`);
  return ref.id;
}

export async function updateFAQ(id: string, data: Partial<FAQFormData>): Promise<void> {
  await updateDoc(doc(db, "faqs", id), data);
  await log("UPDATE", "faqs", id, `Updated FAQ: ${data.question ?? id}`);
}

export async function deleteFAQ(id: string, question: string): Promise<void> {
  await deleteDoc(doc(db, "faqs", id));
  await log("DELETE", "faqs", id, `Deleted FAQ: ${question}`);
}

// ── Reorder (batch) ────────────────────────────────────────

async function reorderCollection(
  collectionName: string,
  items: { id: string; order: number }[]
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach(({ id, order }) => {
    batch.update(doc(db, collectionName, id), { order });
  });
  await batch.commit();
}

export async function reorderServices(items: { id: string; order: number }[]): Promise<void> {
  await reorderCollection("services", items);
}

export async function reorderFAQs(items: { id: string; order: number }[]): Promise<void> {
  await reorderCollection("faqs", items);
}

export async function reorderTestimonials(items: { id: string; order: number }[]): Promise<void> {
  await reorderCollection("testimonials", items);
}

export async function reorderCaseStudies(items: { id: string; order: number }[]): Promise<void> {
  await reorderCollection("caseStudies", items);
}

// ── Blog Posts ─────────────────────────────────────────────────

export async function createBlogPost(data: BlogPostFormData): Promise<string> {
  const ref = await addDoc(collection(db, "blogPosts"), {
    ...data,
    isPublished: false,
    publishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await log("CREATE", "blogPosts", ref.id, `Created blog post: ${data.title}`);
  return ref.id;
}

export async function updateBlogPost(id: string, data: Partial<BlogPostFormData>): Promise<void> {
  await updateDoc(doc(db, "blogPosts", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  await log("UPDATE", "blogPosts", id, `Updated blog post: ${data.title ?? id}`);
}

export async function deleteBlogPost(id: string, title: string): Promise<void> {
  await deleteDoc(doc(db, "blogPosts", id));
  await log("DELETE", "blogPosts", id, `Deleted blog post: ${title}`);
}

export async function publishBlogPost(id: string, title: string, wasPublished: boolean): Promise<void> {
  await updateDoc(doc(db, "blogPosts", id), {
    isPublished: true,
    updatedAt: serverTimestamp(),
    ...(wasPublished ? {} : { publishedAt: serverTimestamp() }),
  });
  await log("PUBLISH", "blogPosts", id, `Published blog post: ${title}`);
}

export async function unpublishBlogPost(id: string, title: string): Promise<void> {
  await updateDoc(doc(db, "blogPosts", id), {
    isPublished: false,
    updatedAt: serverTimestamp(),
  });
  await log("UNPUBLISH", "blogPosts", id, `Unpublished blog post: ${title}`);
}
