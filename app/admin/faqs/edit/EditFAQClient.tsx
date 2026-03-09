"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getFAQById } from "@/lib/firestore/queries";
import { updateFAQ, deleteFAQ } from "@/lib/firestore/mutations";
import { FAQ, FAQFormData } from "@/lib/types";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminForm.module.css";

export default function EditFAQClient() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const [item, setItem] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { getFAQById(id).then(f => { setItem(f); if (f) setForm(f); }); }, [id]);

  const set = (k: keyof FAQFormData, v: unknown) => setForm(f => f ? { ...f, [k]: v } : f);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    await updateFAQ(id, form);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!item || !confirm("Delete this FAQ?")) return;
    setDeleting(true);
    await deleteFAQ(id, item.question);
    router.push("/admin/faqs");
  };

  if (!form) return <div className={`skeleton ${styles.formSkeleton}`} />;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">Edit FAQ</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <AdminCard>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
          <AdminInput label="Question" value={form.question} required onChange={e => set("question", e.target.value)} />
          <AdminTextarea label="Answer" value={form.answer} rows={4} required onChange={e => set("answer", e.target.value)} />
          <AdminInput label="Category" value={form.category} onChange={e => set("category", e.target.value)} />
          <AdminToggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </AdminCard>
        <div className={styles.actions}>
          <AdminButton type="button" variant="danger" loading={deleting} onClick={handleDelete}>Delete</AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/faqs")}>Cancel</AdminButton>
          <AdminButton type="submit" loading={saving}>Save</AdminButton>
        </div>
      </form>
    </div>
  );
}
