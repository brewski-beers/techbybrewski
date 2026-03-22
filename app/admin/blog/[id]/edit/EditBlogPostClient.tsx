"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlogPostById } from "@/lib/firestore/queries";
import { BlogPost } from "@/lib/types";
import BlogPostForm from "@/components/admin/BlogPostForm/BlogPostForm";
import styles from "@/styles/adminForm.module.css";

export default function EditBlogPostClient() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPostById(id).then(setPost).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={`skeleton ${styles.formSkeleton}`} />;
  if (!post) return <p className="text-body text-muted">Post not found.</p>;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">{post.title}</h1>
      <BlogPostForm existing={post} />
    </div>
  );
}
