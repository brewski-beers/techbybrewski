"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "@/lib/storage";
import { storage } from "@/lib/firebase";
import { Service, ServiceFormData } from "@/lib/types";
import { createService, updateService, publishService, unpublishService, deleteService } from "@/lib/firestore/mutations";
import { getAllServices } from "@/lib/firestore/queries";
import { AdminButton, AdminInput, AdminTextarea, AdminToggle, AdminArrayField, AdminCard } from "@/components/admin/ui";
import { slugify } from "@/lib/utils";
import styles from "./ServiceForm.module.css";

const EMPTY: ServiceFormData = {
  name: "", slug: "", summary: "", imageUrl: "", bullets: [], useCases: [],
  order: 0, isActive: true, isPublished: false,
};

interface ServiceFormProps {
  existing?: Service;
}

export default function ServiceForm({ existing }: ServiceFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormData>(existing ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const [, startPublish] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existing) {
      getAllServices().then((sv) => setForm((f) => ({ ...f, order: sv.length + 1 })));
    }
  }, [existing]);

  const set = (key: keyof ServiceFormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.slug) {
      setError("Set a slug before uploading an image.");
      return;
    }
    setError(null);
    startUpload(async () => {
      try {
        const storageRef = ref(storage, `site/services/${form.slug}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        set("imageUrl", url);
        e.target.value = "";
      } catch {
        setError("Image upload failed. Please try again.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.summary.trim()) {
      setError("Name, slug, and summary are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        if (existing) {
          await updateService(existing.id, form);
        } else {
          const id = await createService(form);
          router.push(`/admin/services/edit?id=${id}`);
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
          await unpublishService(existing.id, form.name);
        } else {
          await publishService(existing.id, form.name);
        }
        set("isPublished", !form.isPublished);
      } catch {
        setError("Failed to update publish status.");
      }
    });
  };

  const handleDelete = () => {
    if (!existing || !confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setError(null);
    startDelete(async () => {
      try {
        await deleteService(existing.id, form.name);
        router.push("/admin/services");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
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
      </AdminCard>

      <AdminCard>
        <h2 className={`text-h4 ${styles.cardTitle}`}>Feature Image</h2>
        {form.imageUrl && (
          <div className={styles.imagePreview}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, dimensions unknown */}
            <img src={form.imageUrl} alt="Service feature image" className={styles.thumbnail} />
            <button type="button" onClick={() => set("imageUrl", "")} className={styles.removeImage}>
              Remove
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
        <AdminButton type="button" variant="secondary" loading={isUploading} onClick={() => fileRef.current?.click()}>
          {isUploading ? "Uploading..." : form.imageUrl ? "Replace Image" : "Upload Image"}
        </AdminButton>
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
          <AdminToggle
            label="Published"
            hint="Visible on public site"
            checked={form.isPublished}
            onChange={handlePublishToggle}
          />
        )}
      </AdminCard>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        {existing && (
          <AdminButton type="button" variant="danger" loading={isDeleting} onClick={handleDelete}>
            Delete
          </AdminButton>
        )}
        <AdminButton type="button" variant="secondary" onClick={() => router.push("/admin/services")}>
          Cancel
        </AdminButton>
        <AdminButton type="submit" loading={isSaving}>
          {existing ? "Save Changes" : "Create Service"}
        </AdminButton>
      </div>
    </form>
  );
}
