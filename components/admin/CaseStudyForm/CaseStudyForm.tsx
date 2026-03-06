"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { CaseStudy, CaseStudyFormData } from "@/lib/types";
import { createCaseStudy, updateCaseStudy, publishCaseStudy, unpublishCaseStudy, deleteCaseStudy } from "@/lib/firestore/mutations";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminArrayField, AdminCard } from "@/components/admin/ui";
import styles from "./CaseStudyForm.module.css";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const EMPTY: CaseStudyFormData = {
  title: "", slug: "", clientName: "", industry: "", overview: "",
  problem: [], solution: [], outcomes: [], stack: [], images: [],
  featured: false, order: 0, isPublished: false,
};

export default function CaseStudyForm({ existing }: { existing?: CaseStudy }) {
  const router = useRouter();
  const [form, setForm] = useState<CaseStudyFormData>(existing ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof CaseStudyFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form.slug) return alert("Set a slug before uploading images.");
    setUploading(true);
    const storageRef = ref(storage, `site/caseStudies/${form.slug}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    set("images", [...form.images, { url, alt: file.name.replace(/\.[^.]+$/, ""), order: form.images.length }]);
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (i: number) => set("images", form.images.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (existing) {
      await updateCaseStudy(existing.id, form);
    } else {
      const id = await createCaseStudy(form);
      router.push(`/admin/case-studies/${id}`);
      return;
    }
    setSaving(false);
  };

  const handlePublishToggle = async () => {
    if (!existing) return;
    if (form.isPublished) {
      await unpublishCaseStudy(existing.id, form.title);
    } else {
      await publishCaseStudy(existing.id, form.title, existing.isPublished);
    }
    set("isPublished", !form.isPublished);
  };

  const handleDelete = async () => {
    if (!existing || !confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteCaseStudy(existing.id, form.title);
    router.push("/admin/case-studies");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Details</h2>
        <AdminInput label="Title" value={form.title} required onChange={(e) => { set("title", e.target.value); if (!existing) set("slug", slugify(e.target.value)); }} />
        <AdminInput label="Slug" value={form.slug} required hint="URL: /case-studies/slug" onChange={(e) => set("slug", slugify(e.target.value))} />
        <AdminInput label="Client Name" value={form.clientName} hint="Use 'Confidential' to anonymize" onChange={(e) => set("clientName", e.target.value)} />
        <AdminInput label="Industry" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
        <AdminInput label="Display Order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
      </AdminCard>

      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
        <AdminTextarea label="Overview" value={form.overview} rows={4} required onChange={(e) => set("overview", e.target.value)} />
        <AdminArrayField label="Problem" hint="What challenges did the client face?" values={form.problem} onChange={(v) => set("problem", v)} placeholder="Add a problem statement..." />
        <AdminArrayField label="Solution" hint="How did you solve it?" values={form.solution} onChange={(v) => set("solution", v)} placeholder="Add a solution point..." />
        <AdminArrayField label="Outcomes" hint="Measurable results" values={form.outcomes} onChange={(v) => set("outcomes", v)} placeholder="Add an outcome..." />
        <AdminArrayField label="Tech Stack" values={form.stack} onChange={(v) => set("stack", v)} placeholder="React, Firebase, etc." />
      </AdminCard>

      <AdminCard>
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
        <AdminButton type="button" variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? "Uploading..." : "Upload Image"}
        </AdminButton>
      </AdminCard>

      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
        <AdminToggle label="Featured" hint="Show on homepage featured section" checked={form.featured} onChange={(v) => set("featured", v)} />
        {existing && <AdminToggle label="Published" hint="Visible on public site" checked={form.isPublished} onChange={handlePublishToggle} />}
      </AdminCard>

      <div className={styles.actions}>
        {existing && <AdminButton type="button" variant="danger" loading={deleting} onClick={handleDelete}>Delete</AdminButton>}
        <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/case-studies")}>Cancel</AdminButton>
        <AdminButton type="submit" loading={saving}>{existing ? "Save Changes" : "Create Case Study"}</AdminButton>
      </div>
    </form>
  );
}
