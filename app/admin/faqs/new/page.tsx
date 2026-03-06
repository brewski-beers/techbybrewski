"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFAQ } from "@/lib/firestore/mutations";
import { FAQFormData } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminForm.module.css";

const EMPTY: FAQFormData = { question: "", answer: "", category: "", order: 0, isPublished: false };

export default function NewFAQPage() {
  const router = useRouter();
  const [form, setForm] = useState<FAQFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FAQFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await createFAQ(form);
    router.push("/admin/faqs");
  };
  return (
    <div className={styles.page}>
      <h1 className="text-h2">New FAQ</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
          <AdminInput label="Question" value={form.question} required onChange={e => set("question", e.target.value)} />
          <AdminTextarea label="Answer" value={form.answer} rows={4} required onChange={e => set("answer", e.target.value)} />
          <AdminInput label="Category" value={form.category} hint="Optional grouping label" onChange={e => set("category", e.target.value)} />
          <AdminInput label="Display Order" type="number" value={form.order} onChange={e => set("order", Number(e.target.value))} />
          <AdminToggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </AdminCard>
        <div className={styles.actions}>
          <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/faqs")}>Cancel</AdminButton>
          <AdminButton type="submit" loading={saving}>Create</AdminButton>
        </div>
      </form>
    </div>
  );
}
