import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

function verifySecret(req: NextRequest): boolean {
  const secret = process.env.BLOG_SCHEDULER_SECRET;
  if (!secret) return false;
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    author?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, slug, excerpt, content, tags, author } = body;

  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json(
      { error: "title, slug, excerpt, and content are required" },
      { status: 400 }
    );
  }

  try {
    const docRef = await adminDb.collection("blogPosts").add({
      title,
      slug,
      excerpt,
      content,
      tags: tags ?? [],
      author: author ?? "KB",
      isPublished: true,
      publishedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        id: docRef.id,
        url: `https://techbybrewski.com/blog/${slug}`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("blog/publish error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
