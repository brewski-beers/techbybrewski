"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial } from "@/lib/firestore/mutations";
import { TestimonialFormData } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminForm.module.css";

const EMPTY: TestimonialFormData = { quote: "", name: "", title: "", company: "", avatarUrl: "", order: 0, isPublished: false };

export default function NewTestimonialPage() {
  const router = useRouter();
  const [form, setForm] = useState<TestimonialFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof TestimonialFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

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
          <AdminInput label="Avatar URL" type="url" value={form.avatarUrl} onChange={e => set("avatarUrl", e.target.value)} />
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
