"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "@/lib/storage";
import { storage } from "@/lib/firebase";
import { BlogPost, BlogPostFormData } from "@/lib/types";
import {
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  deleteBlogPost,
} from "@/lib/firestore/mutations";
import { Button, Input, Textarea, Toggle, ArrayField, Card } from "@/components/ui";
import { slugify } from "@/lib/utils";
import styles from "./BlogPostForm.module.css";

const EMPTY: BlogPostFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  tags: [],
  author: "KB",
  isPublished: false,
};

interface BlogPostFormProps {
  existing?: BlogPost;
}

export default function BlogPostForm({ existing }: BlogPostFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostFormData>(
    existing
      ? {
          title: existing.title,
          slug: existing.slug,
          excerpt: existing.excerpt,
          content: existing.content,
          coverImageUrl: existing.coverImageUrl ?? "",
          tags: existing.tags,
          author: existing.author,
          isPublished: existing.isPublished,
        }
      : EMPTY
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [, startPublish] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof BlogPostFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.slug) {
      setError("Set a slug before uploading a cover image.");
      return;
    }
    setError(null);
    startUpload(async () => {
      try {
        const storageRef = ref(
          storage,
          `site/blog/${form.slug}/${Date.now()}-${file.name}`
        );
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        set("coverImageUrl", url);
        e.target.value = "";
      } catch {
        setError("Image upload failed. Please try again.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.excerpt.trim()) {
      setError("Title, slug, and excerpt are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        if (existing) {
          await updateBlogPost(existing.id, form);
        } else {
          const id = await createBlogPost(form);
          router.push(`/admin/blog/${id}/edit`);
        }
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  };

  const handlePublishToggle = () => {
    if (!existing) return;
    setError(null);
    startPublish(async () => {
      try {
        if (form.isPublished) {
          await unpublishBlogPost(existing.id, form.title);
        } else {
          await publishBlogPost(existing.id, form.title, !!existing.publishedAt);
        }
        set("isPublished", !form.isPublished);
      } catch {
        setError("Failed to update publish status.");
      }
    });
  };

  const handleDelete = () => {
    if (!existing || !confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    setError(null);
    startDelete(async () => {
      try {
        await deleteBlogPost(existing.id, form.title);
        router.push("/admin/blog");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Details</h2>
        <Input
          label="Title"
          value={form.title}
          required
          onChange={(e) => {
            set("title", e.target.value);
            if (!existing) set("slug", slugify(e.target.value));
          }}
        />
        <Input
          label="Slug"
          value={form.slug}
          required
          hint="URL path: /blog/slug"
          onChange={(e) => set("slug", slugify(e.target.value))}
        />
        <Input
          label="Author"
          value={form.author}
          required
          onChange={(e) => set("author", e.target.value)}
        />
        <Textarea
          label="Excerpt"
          value={form.excerpt}
          rows={2}
          required
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Cover Image</h2>
        {form.coverImageUrl && (
          <div className={styles.imagePreview}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, dimensions unknown */}
            <img
              src={form.coverImageUrl}
              alt="Cover image"
              className={styles.thumbnail}
            />
            <button
              type="button"
              onClick={() => set("coverImageUrl", "")}
              className={styles.removeImage}
            >
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.fileInput}
        />
        <Button
          type="button"
          variant="secondary"
          loading={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          {isUploading
            ? "Uploading..."
            : form.coverImageUrl
            ? "Replace Image"
            : "Upload Image"}
        </Button>
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
        <Textarea
          label="Content (Markdown)"
          value={form.content}
          rows={20}
          onChange={(e) => set("content", e.target.value)}
        />
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Tags</h2>
        <ArrayField
          label="Tags"
          hint="e.g. ai, infrastructure, architecture"
          values={form.tags}
          onChange={(v) => set("tags", v)}
          placeholder="Add a tag..."
        />
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
        {existing && (
          <Toggle
            label="Published"
            hint="Visible on public blog"
            checked={form.isPublished}
            onChange={handlePublishToggle}
          />
        )}
        {!existing && (
          <p className="text-body-sm text-muted">
            Save the post first, then publish it from the edit view.
          </p>
        )}
      </Card>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        {existing && (
          <Button
            type="button"
            variant="danger"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSaving}>
          {existing ? "Save Changes" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
