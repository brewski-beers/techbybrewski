"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createFAQ } from "@/lib/firestore/mutations";
import { getAllFAQs } from "@/lib/firestore/queries";
import { FAQFormData } from "@/lib/types";
import { Button, Input, Textarea, Toggle, Card } from "@/components/ui";
import styles from "@/styles/adminForm.module.css";

const EMPTY: FAQFormData = { question: "", answer: "", category: "", order: 0, isPublished: false };

export default function NewFAQPage() {
  const router = useRouter();
  const [form, setForm] = useState<FAQFormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FAQFormData, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Auto-set order to count + 1
  useEffect(() => {
    getAllFAQs().then(items => setForm(f => ({ ...f, order: items.length + 1 })));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    await createFAQ(form);
    router.push("/admin/faqs");
  };
  return (
    <div className={styles.page}>
      <h1 className="text-h2">New FAQ</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Card>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
          <Input label="Question" value={form.question} required onChange={e => set("question", e.target.value)} />
          <Textarea label="Answer" value={form.answer} rows={4} required onChange={e => set("answer", e.target.value)} />
          <Input label="Category" value={form.category} hint="Optional grouping label" onChange={e => set("category", e.target.value)} />
          <Toggle label="Published" checked={form.isPublished} onChange={v => set("isPublished", v)} />
        </Card>
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/faqs")}>Cancel</Button>
          <Button type="submit" loading={saving}>Create</Button>
        </div>
      </form>
    </div>
  );
}
