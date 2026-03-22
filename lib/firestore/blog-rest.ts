/**
 * Server-side blog post helpers using the Firebase Admin SDK.
 * Follows the same patterns as rest.ts.
 *
 * DO NOT add "use client" — this file is server-only.
 */

import { adminDb } from "@/lib/firebase-admin";
import type { BlogPost } from "@/lib/types";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";

// ── Shape helper ───────────────────────────────────────────────

function toBlogPost(id: string, d: DocumentData): BlogPost {
  return {
    id,
    title: (d.title as string) ?? "",
    slug: (d.slug as string) ?? "",
    excerpt: (d.excerpt as string) ?? "",
    content: (d.content as string) ?? "",
    coverImageUrl: (d.coverImageUrl as string | undefined),
    tags: (d.tags as string[]) ?? [],
    author: (d.author as string) ?? "",
    isPublished: (d.isPublished as boolean) ?? false,
    publishedAt: d.publishedAt ?? null,
    createdAt: d.createdAt ?? null,
    updatedAt: d.updatedAt ?? null,
  };
}

// ── Public query helpers ───────────────────────────────────────

export async function getPublishedBlogPostsRest(): Promise<BlogPost[]> {
  const snap = await adminDb
    .collection("blogPosts")
    .where("isPublished", "==", true)
    .orderBy("publishedAt", "desc")
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => toBlogPost(doc.id, doc.data()));
}

export async function getBlogPostBySlugRest(slug: string): Promise<BlogPost | null> {
  const snap = await adminDb
    .collection("blogPosts")
    .where("isPublished", "==", true)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toBlogPost(doc.id, doc.data());
}

export async function getPublishedBlogPostSlugsRest(): Promise<string[]> {
  const snap = await adminDb
    .collection("blogPosts")
    .where("isPublished", "==", true)
    .get();
  return snap.docs.map((doc: QueryDocumentSnapshot) => doc.data().slug as string).filter(Boolean);
}
