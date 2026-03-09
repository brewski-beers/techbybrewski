"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "@/lib/storage";
import { storage } from "@/lib/firebase";
import { createTestimonial } from "@/lib/firestore/mutations";
import { TestimonialFormData } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminForm.module.css";

const EMPTY: TestimonialFormData = { quote: "", name: "", title: "", company: "", avatarUrl: "", order: 0, isPublished: false };

export default function NewTestimonialPage() {
  const router = useRouter();
  const [form, setForm] = useState<TestimonialFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof TestimonialFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const storageRef = ref(storage, `site/testimonials/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    set("avatarUrl", url);
    setUploading(false);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createTestimonial(form);
    router.push("/admin/testimonials");
  };

  return (
    <div className={styles.page}>
      <h1 className="text-h2">New Testimonial</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
          <AdminTextarea label="Quote" value={form.quote} rows={4} required onChange={e => set("quote", e.target.value)} />
          <AdminInput label="Name" value={form.name} required onChange={e => set("name", e.target.value)} />
          <AdminInput label="Title / Role" value={form.title} onChange={e => set("title", e.target.value)} />
          <AdminInput label="Company" value={form.company} onChange={e => set("company", e.target.value)} />
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Avatar</h2>
          {form.avatarUrl && (
            <div className={styles.avatarPreview}>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img src={form.avatarUrl} alt="Avatar preview" className={styles.avatarThumb} />
              <button type="button" onClick={() => set("avatarUrl", "")} className={styles.removeAvatar}>Remove</button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className={styles.fileInput} />
          <AdminButton type="button" variant="secondary" loading={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? "Uploading..." : form.avatarUrl ? "Replace Photo" : "Upload Photo"}
          </AdminButton>
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
          <AdminInput label="Display Order" type="number" value={form.order} onChange={e => set("order", Number(e.target.value))} />
          <AdminToggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </AdminCard>

        <div className={styles.actions}>
          <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/testimonials")}>Cancel</AdminButton>
          <AdminButton type="submit" loading={saving}>Create</AdminButton>
        </div>
      </form>
    </div>
  );
}
