"use client";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getClient } from "@/lib/firestore/portalQueries";
import { updateClient, deleteClient } from "@/lib/firestore/portalMutations";
import { Client, ClientFormData } from "@/lib/types";
import { Button, Input, Textarea, ArrayField, Card } from "@/components/ui";
import styles from "@/styles/adminForm.module.css";

const STATUS_OPTIONS: Client["status"][] = ["active", "paused", "archived"];

export default function EditClientClient() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const [item, setItem] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    getClient(id).then((c) => {
      setItem(c);
      if (c) {
        const { id: _id, createdAt: _c, updatedAt: _u, ...formData } = c;
        void _id; void _c; void _u;
        setForm(formData);
      }
    });
  }, [id]);

  const set = (k: keyof ClientFormData, v: unknown) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    startSave(async () => {
      try {
        await updateClient(id, form);
      } catch {
        setError("Save failed. Please try again.");
      }
    });
  };

  const handleDelete = () => {
    if (!item || !confirm(`Delete client "${item.companyName}"? This cannot be undone.`)) return;
    setError(null);
    startDelete(async () => {
      try {
        await deleteClient(id);
        router.push("/admin/clients");
      } catch {
        setError("Delete failed. Please try again.");
      }
    });
  };

  if (!form) return <div className={`skeleton ${styles.formSkeleton}`} />;

  return (
    <div className={styles.page}>
      <h1 className="text-h2">{form.companyName}</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Card>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Contact Info</h2>
          <Input
            label="Email"
            type="email"
            value={form.email}
            required
            onChange={(e) => set("email", e.target.value)}
          />
          <Input
            label="Company Name"
            value={form.companyName}
            required
            onChange={(e) => set("companyName", e.target.value)}
          />
          <Input
            label="Contact Name"
            value={form.contactName}
            required
            onChange={(e) => set("contactName", e.target.value)}
          />
        </Card>

        <Card>
          <h2 className={`text-h4 ${styles.cardTitle}`}>Engagement</h2>
          <div className={styles.field}>
            <label className={`text-label ${styles.label}`}>Status</label>
            <select
              className={styles.select}
              value={form.status}
              onChange={(e) => set("status", e.target.value as Client["status"])}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <ArrayField
            label="Services"
            values={form.services}
            onChange={(v) => set("services", v)}
            placeholder="e.g. Firebase Architecture"
          />
          <Textarea
            label="Internal Notes"
            value={form.notes}
            rows={3}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Card>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="danger"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/clients")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
