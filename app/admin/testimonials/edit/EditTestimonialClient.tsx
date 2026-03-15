"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "@/lib/storage";
import { storage } from "@/lib/firebase";
import { getTestimonialById } from "@/lib/firestore/queries";
import { updateTestimonial, deleteTestimonial } from "@/lib/firestore/mutations";
import { Testimonial, TestimonialFormData } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminForm.module.css";

export default function EditTestimonialClient() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const [item, setItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTestimonialById(id).then(t => { setItem(t); if (t) setForm(t); });
  }, [id]);

  const set = (k: keyof TestimonialFormData, v: unknown) => setForm(f => f ? { ...f, [k]: v } : f);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    startUpload(async () => {
      try {
        const storageRef = ref(storage, `site/testimonials/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        set("avatarUrl", url);
        e.target.value = "";
      } catch {
        setError("Avatar upload failed. Please try again.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.quote.trim() || !form.name.trim()) {
      setError("Quote and name are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        await updateTestimonial(id, form);
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  };

  const handleDelete = () => {
    if (!item || !confirm(`Delete testimonial from "${item.name}"?`)) return;
    setError(null);
    startDelete(async () => {
      try {
        await deleteTestimonial(id, item.name);
        router.push("/admin/testimonials");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
  };

  if (!form) return <div className={`skeleton ${styles.formSkeleton}`} />;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">{form.name}</h1>
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
              <img src={form.avatarUrl} alt={form.name} className={styles.avatarThumb} />
              <button type="button" onClick={() => set("avatarUrl", "")} className={styles.removeAvatar}>Remove</button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className={styles.fileInput} />
          <AdminButton type="button" variant="secondary" loading={isUploading} onClick={() => fileRef.current?.click()}>
            {isUploading ? "Uploading..." : form.avatarUrl ? "Replace Photo" : "Upload Photo"}
          </AdminButton>
        </AdminCard>

        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
          <AdminInput label="Display Order" type="number" value={form.order} onChange={e => set("order", Number(e.target.value))} />
          <AdminToggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </AdminCard>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <AdminButton type="button" variant="danger" loading={isDeleting} onClick={handleDelete}>Delete</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/testimonials")}>Cancel</AdminButton>
          <AdminButton type="submit" loading={isSaving}>Save</AdminButton>
        </div>
      </form>
    </div>
  );
}
