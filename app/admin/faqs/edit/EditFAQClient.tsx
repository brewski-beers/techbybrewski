"use client";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getFAQById } from "@/lib/firestore/queries";
import { updateFAQ, deleteFAQ } from "@/lib/firestore/mutations";
import { FAQ, FAQFormData } from "@/lib/types";
import { Button, Input, Textarea, Toggle, Card } from "@/components/ui";
import styles from "@/styles/adminForm.module.css";

export default function EditFAQClient() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const [item, setItem] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => { getFAQById(id).then(f => { setItem(f); if (f) setForm(f); }); }, [id]);

  const set = (k: keyof FAQFormData, v: unknown) => setForm(f => f ? { ...f, [k]: v } : f);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.question.trim() || !form.answer.trim()) {
      setError("Question and answer are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        await updateFAQ(id, form);
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  };

  const handleDelete = () => {
    if (!item || !confirm("Delete this FAQ?")) return;
    setError(null);
    startDelete(async () => {
      try {
        await deleteFAQ(id, item.question);
        router.push("/admin/faqs");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
  };

  if (!form) return <div className={`skeleton ${styles.formSkeleton}`} />;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">Edit FAQ</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Card>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
          <Input label="Question" value={form.question} required onChange={e => set("question", e.target.value)} />
          <Textarea label="Answer" value={form.answer} rows={4} required onChange={e => set("answer", e.target.value)} />
          <Input label="Category" value={form.category} onChange={e => set("category", e.target.value)} />
          <Toggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </Card>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button type="button" variant="danger" loading={isDeleting} onClick={handleDelete}>Delete</Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/faqs")}>Cancel</Button>
          <Button type="submit" loading={isSaving}>Save</Button>
        </div>
      </form>
    </div>
  );
}
