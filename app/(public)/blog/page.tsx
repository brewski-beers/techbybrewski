import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedBlogPostsRest } from "@/lib/firestore/blog-rest";
import type { BlogPost } from "@/lib/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, tutorials, and updates from TechByBrewski — web development, Firebase, Next.js, and building software for small businesses.",
  alternates: { canonical: "/blog" },
  openGraph: { images: ["/og-image.png"] },
};

function formatDate(post: BlogPost): string {
  const ts = post.publishedAt;
  if (!ts) return "";
  const date = typeof ts === "object" && "toDate" in ts ? (ts as { toDate(): Date }).toDate() : new Date(ts as unknown as string);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPostsRest();

  return (
    <section className="section">
      <div className="container">
        <div className={styles.header}>
          <p className="text-overline">From the Studio</p>
          <h1 className={`text-headline ${styles.title}`}>Blog</h1>
          <p className={`text-body-lg text-muted ${styles.subtitle}`}>
            Insights on web development, Firebase, Next.js, and building software for small businesses.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className={`text-body text-muted ${styles.empty}`}>No posts yet — check back soon.</p>
        ) : (
          <ul className={styles.grid} role="list">
            {posts.map((post) => (
              <li key={post.id} className={styles.card}>
                <Link href={`/blog/${post.slug}`} className={styles.cardLink} aria-label={`Read: ${post.title}`}>
                  {post.coverImageUrl && (
                    <div className={styles.cardImage}>
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.cardImg}
                      />
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    {post.tags.length > 0 && (
                      <div className={styles.tags} aria-label="Tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <h2 className={`text-title ${styles.cardTitle}`}>{post.title}</h2>
                    <p className={`text-body text-muted ${styles.excerpt}`}>{post.excerpt}</p>
                    <div className={styles.meta}>
                      <span className="text-sm text-muted">{post.author}</span>
                      {formatDate(post) && (
                        <>
                          <span className={styles.metaDot} aria-hidden="true">·</span>
                          <time className="text-sm text-muted" dateTime={formatDate(post)}>{formatDate(post)}</time>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
