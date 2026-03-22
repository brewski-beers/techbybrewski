"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getAllBlogPosts } from "@/lib/firestore/queries";
import { BlogPost } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import styles from "@/styles/adminList.module.css";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      getAllBlogPosts().then(setPosts).finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Blog</h1>
          <p className="text-body text-muted">{posts.length} total</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={`skeleton ${styles.skeleton}`} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <p className="text-body text-muted">
            No posts yet.{" "}
            <Link href="/admin/blog/new" className="text-accent">
              Write one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <div key={post.id} className={styles.item}>
              <Link
                href={`/admin/blog/${post.id}/edit`}
                className={styles.itemMain}
              >
                <span className="text-body font-semibold">{post.title}</span>
                <span className="text-body-sm text-muted">/blog/{post.slug}</span>
              </Link>
              <div className={styles.itemMeta}>
                <Badge variant={post.isPublished ? "published" : "draft"}>
                  {post.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
