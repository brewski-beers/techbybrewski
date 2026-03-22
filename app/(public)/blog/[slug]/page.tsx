import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getBlogPostBySlugRest,
  getPublishedBlogPostSlugsRest,
} from "@/lib/firestore/blog-rest";
import type { BlogPost } from "@/lib/types";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedBlogPostSlugsRest();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Firestore unavailable at build time (e.g. no ADC in Cloud Build).
    // Return empty — Next.js will render pages dynamically at runtime.
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlugRest(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : ["/og-image.png"],
      type: "article",
    },
  };
}

function formatDate(post: BlogPost): string {
  const ts = post.publishedAt;
  if (!ts) return "";
  const date = typeof ts === "object" && "toDate" in ts ? (ts as { toDate(): Date }).toDate() : new Date(ts as unknown as string);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlugRest(slug);
  if (!post) notFound();

  const dateStr = formatDate(post);

  return (
    <article className="section">
      <div className={`container ${styles.layout}`}>

        {/* Back link */}
        <Link href="/blog" className={styles.back}>
          ← Back to Blog
        </Link>

        {/* Header */}
        <header className={styles.header}>
          {post.tags.length > 0 && (
            <div className={styles.tags} aria-label="Tags">
              {post.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
          <h1 className={`text-headline ${styles.title}`}>{post.title}</h1>
          <p className={`text-body-lg text-muted ${styles.excerpt}`}>{post.excerpt}</p>
          <div className={styles.meta}>
            <span className="text-sm text-muted">{post.author}</span>
            {dateStr && (
              <>
                <span className={styles.metaDot} aria-hidden="true">·</span>
                <time className="text-sm text-muted" dateTime={dateStr}>{dateStr}</time>
              </>
            )}
          </div>
        </header>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className={styles.coverWrap}>
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 900px"
              className={styles.coverImg}
            />
          </div>
        )}

        {/* Markdown content */}
        <div className={styles.prose}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer nav */}
        <div className={styles.footer}>
          <Link href="/blog" className={styles.back}>
            ← Back to Blog
          </Link>
        </div>

      </div>
    </article>
  );
}
