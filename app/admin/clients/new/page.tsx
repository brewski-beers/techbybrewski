"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { ClientFormData } from "@/lib/types";
import { Button, Input, Textarea, ArrayField, Card } from "@/components/ui";
import styles from "@/styles/adminForm.module.css";

const EMPTY: ClientFormData = {
  email: "",
  companyName: "",
  contactName: "",
  status: "active",
  services: [],
  notes: "",
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();

  const set = (k: keyof ClientFormData, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.companyName.trim() || !form.contactName.trim()) {
      setError("Email, company name, and contact name are required.");
      return;
    }
    setError(null);
    startSave(async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Not authenticated");
        const token = await currentUser.getIdToken();

        const res = await fetch("/api/admin/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? "Failed to create client");
        }

        router.push("/admin/clients");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create client.");
      }
    });
  };

  return (
    <div className={styles.page}>
      <h1 className="text-h2">New Client</h1>
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
            variant="secondary"
            onClick={() => router.push("/admin/clients")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSaving}>
            Create Client
          </Button>
        </div>
      </form>
    </div>
  );
}
