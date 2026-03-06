"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Service, ServiceFormData } from "@/lib/types";
import { createService, updateService, publishService, unpublishService, deleteService } from "@/lib/firestore/mutations";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminArrayField, AdminCard } from "@/components/admin/ui";
import styles from "./ServiceForm.module.css";

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const EMPTY: ServiceFormData = {
  name: "", slug: "", summary: "", bullets: [], useCases: [],
  order: 0, isActive: true, isPublished: false,
};

interface ServiceFormProps {
  existing?: Service;
}

export default function ServiceForm({ existing }: ServiceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormData>(existing ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (key: keyof ServiceFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (existing) {
      await updateService(existing.id, form);
    } else {
      const id = await createService(form);
      router.push(`/admin/services/edit?id=${id}`);
      return;
    }
    setSaving(false);
  };

  const handlePublishToggle = async () => {
    if (!existing) return;
    if (form.isPublished) {
      await unpublishService(existing.id, form.name);
    } else {
      await publishService(existing.id, form.name);
    }
    set("isPublished", !form.isPublished);
  };

  const handleDelete = async () => {
    if (!existing || !confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteService(existing.id, form.name);
    router.push("/admin/services");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Details</h2>
        <AdminInput
          label="Name" value={form.name} required
          onChange={(e) => {
            set("name", e.target.value);
            if (!existing) set("slug", slugify(e.target.value));
          }}
        />
        <AdminInput
          label="Slug" value={form.slug} required
          hint="URL path: /services/slug"
          onChange={(e) => set("slug", slugify(e.target.value))}
        />
        <AdminTextarea
          label="Summary" value={form.summary} rows={3} required
          onChange={(e) => set("summary", e.target.value)}
        />
        <AdminInput
          label="Display Order" type="number" value={form.order}
          onChange={(e) => set("order", Number(e.target.value))}
        />
      </AdminCard>

      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Content</h2>
        <AdminArrayField label="Bullets" hint="Key selling points" values={form.bullets} onChange={(v) => set("bullets", v)} placeholder="Add a bullet point..." />
        <AdminArrayField label="Use Cases" hint="Who is this for?" values={form.useCases} onChange={(v) => set("useCases", v)} placeholder="Add a use case..." />
      </AdminCard>

      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Visibility</h2>
        <AdminToggle label="Active" hint="Show in services listing" checked={form.isActive} onChange={(v) => set("isActive", v)} />
        {existing && (
          <AdminToggle label="Published" hint="Visible on public site" checked={form.isPublished} onChange={handlePublishToggle} />
        )}
      </AdminCard>

      <div className={styles.actions}>
        {existing && (
          <AdminButton type="button" variant="danger" loading={deleting} onClick={handleDelete}>
            Delete
          </AdminButton>
        )}
        <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/services")}>
          Cancel
        </AdminButton>
        <AdminButton type="submit" loading={saving}>
          {existing ? "Save Changes" : "Create Service"}
        </AdminButton>
      </div>
    </form>
  );
}
