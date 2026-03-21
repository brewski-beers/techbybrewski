"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "@/lib/storage";
import { storage } from "@/lib/firebase";
import { CaseStudy, CaseStudyFormData } from "@/lib/types";
import { createCaseStudy, updateCaseStudy, publishCaseStudy, unpublishCaseStudy, deleteCaseStudy } from "@/lib/firestore/mutations";
import { Button, Input, Textarea, Toggle, ArrayField, Card } from "@/components/ui";
import { slugify } from "@/lib/utils";
import styles from "./CaseStudyForm.module.css";

const EMPTY: CaseStudyFormData = {
  title: "", slug: "", clientName: "", industry: "", overview: "",
  problem: [], solution: [], outcomes: [], stack: [], images: [],
  featured: false, order: 0, isPublished: false,
};

export default function CaseStudyForm({ existing }: { existing?: CaseStudy }) {
  const router = useRouter();
  const [form, setForm] = useState<CaseStudyFormData>(existing ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [, startPublish] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof CaseStudyFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.slug) {
      setError("Set a slug before uploading images.");
      return;
    }
    setError(null);
    startUpload(async () => {
      try {
        const storageRef = ref(storage, `site/caseStudies/${form.slug}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        set("images", [...form.images, { url, alt: file.name.replace(/\.[^.]+$/, ""), order: form.images.length }]);
        e.target.value = "";
      } catch {
        setError("Image upload failed. Please try again.");
      }
    });
  };

  const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.overview.trim()) {
      setError("Title, slug, and overview are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        if (existing) {
          await updateCaseStudy(existing.id, form);
        } else {
          const id = await createCaseStudy(form);
          router.push(`/admin/case-studies/edit?id=${id}`);
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
          await unpublishCaseStudy(existing.id, form.title);
        } else {
          await publishCaseStudy(existing.id, form.title, existing.isPublished);
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
        await deleteCaseStudy(existing.id, form.title);
        router.push("/admin/case-studies");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Details</h2>
        <Input label="Title" value={form.title} required onChange={(e) => { set("title", e.target.value); if (!existing) set("slug", slugify(e.target.value)); }} />
        <Input label="Slug" value={form.slug} required hint="URL: /case-studies/slug" onChange={(e) => set("slug", slugify(e.target.value))} />
        <Input label="Client Name" value={form.clientName} hint="Use 'Confidential' to anonymize" onChange={(e) => set("clientName", e.target.value)} />
        <Input label="Industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        <Input label="Display Order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
        <Textarea label="Overview" value={form.overview} rows={4} required onChange={(e) => set("overview", e.target.value)} />
        <ArrayField label="Problem" hint="What challenges did the client face?" values={form.problem} onChange={(v) => set("problem", v)} placeholder="Add a problem statement..." />
        <ArrayField label="Solution" hint="How did you solve it?" values={form.solution} onChange={(v) => set("solution", v)} placeholder="Add a solution point..." />
        <ArrayField label="Outcomes" hint="Measurable results" values={form.outcomes} onChange={(v) => set("outcomes", v)} placeholder="Add an outcome..." />
        <ArrayField label="Tech Stack" values={form.stack} onChange={(v) => set("stack", v)} placeholder="React, Firebase, etc." />
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Images</h2>
        {form.images.length > 0 && (
          <div className={styles.imageGrid}>
            {form.images.map((img, i) => (
              <div key={i} className={styles.imageItem}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, dimensions unknown at render */}
                <img src={img.url} alt={img.alt} className={styles.thumbnail} />
                <input
                  className={styles.altInput}
                  value={img.alt}
                  placeholder="Alt text"
                  onChange={(e) => set("images", form.images.map((im, idx) => idx === i ? { ...im, alt: e.target.value } : im))}
                />
                <button type="button" onClick={() => removeImage(i)} className={styles.removeImage}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
        <Button type="button" variant="secondary" loading={isUploading} onClick={() => fileRef.current?.click()}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </Card>

      <Card>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
        <Toggle label="Featured" hint="Show on homepage featured section" checked={form.featured} onChange={(v) => set("featured", v)} />
        {existing && <Toggle label="Published" hint="Visible on public site" checked={form.isPublished} onChange={handlePublishToggle} />}
      </Card>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        {existing && <Button type="button" variant="danger" loading={isDeleting} onClick={handleDelete}>Delete</Button>}
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/case-studies")}>Cancel</Button>
        <Button type="submit" loading={isSaving}>{existing ? "Save Changes" : "Create Case Study"}</Button>
      </div>
    </form>
  );
}
