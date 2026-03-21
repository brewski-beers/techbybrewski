"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getClient,
  getClientDocuments,
  getClientContracts,
  getClientInvoices,
} from "@/lib/firestore/portalQueries";
import { createInvoice, updateInvoiceStatus } from "@/lib/firestore/portalMutations";
import DocumentList from "@/components/portal/DocumentList/DocumentList";
import FileUpload from "@/components/portal/FileUpload/FileUpload";
import MessageThread from "@/components/portal/MessageThread/MessageThread";
import { Button, Badge, Card } from "@/components/ui";
import { INVOICE_STATUS_VARIANT, INVOICE_STATUS_LABEL } from "@/lib/constants/invoiceStatus";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type {
  Client,
  ClientDocument,
  ClientContract,
  ClientInvoice,
  DocumentCategory,
} from "@/lib/types";
import styles from "@/styles/portal.module.css";
import formStyles from "@/styles/adminForm.module.css";

type Tab = "documents" | "messages" | "invoices";

const DOC_CATEGORIES: { key: DocumentCategory; label: string }[] = [
  { key: "contracts", label: "Contracts" },
  { key: "deliverables", label: "Deliverables" },
  { key: "assets", label: "Assets" },
  { key: "files", label: "Other Files" },
];

const INVOICE_STATUSES: ClientInvoice["status"][] = [
  "draft", "sent", "pending", "paid", "failed", "refunded",
];

export default function AdminClientViewPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("id");

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("documents");

  useEffect(() => {
    if (!clientId) return;
    getClient(clientId)
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  if (!clientId) {
    return <p className="text-body text-muted">No client ID provided.</p>;
  }

  if (loading) {
    return <div className={`skeleton ${formStyles.formSkeleton}`} />;
  }

  if (!client) {
    return (
      <Card>
        <p className="text-body text-muted">Client not found.</p>
      </Card>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "documents", label: "Documents" },
    { key: "messages", label: "Messages" },
    { key: "invoices", label: "Invoices" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={`text-h2 ${styles.headerTitle}`}>{client.companyName}</h1>
          <p className="text-body text-muted">
            {client.contactName} · {client.email}
          </p>
        </div>
        <Link href={`/admin/clients/edit?id=${clientId}`}>
          <Button variant="secondary">Edit Client</Button>
        </Link>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "documents" && <DocumentsTab clientId={clientId} />}
      {activeTab === "messages" && <MessageThread clientId={clientId} viewerRole="admin" />}
      {activeTab === "invoices" && <InvoicesTab clientId={clientId} />}
    </div>
  );
}

/* ── Documents Tab ──────────────────────────────────────────────── */

function DocumentsTab({ clientId }: { clientId: string }) {
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("contracts");
  const [items, setItems] = useState<(ClientDocument | ClientContract)[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const promise =
      activeCategory === "contracts"
        ? getClientContracts(clientId)
        : getClientDocuments(clientId, activeCategory as Exclude<DocumentCategory, "contracts">);
    promise
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId, activeCategory]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className={styles.tabs}>
        {DOC_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.tab} ${activeCategory === cat.key ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <FileUpload clientId={clientId} category={activeCategory} onComplete={load} />

      <div className={styles.docList}>
        {loading ? (
          <div className={styles.empty}>Loading…</div>
        ) : (
          <DocumentList items={items} showSignature={activeCategory === "contracts"} />
        )}
      </div>
    </div>
  );
}

/* ── Invoices Tab ────────────────────────────────────────────────── */

const EMPTY_FORM = {
  type: "one-time" as ClientInvoice["type"],
  amount: "",
  currency: "USD",
  description: "",
  dueDate: "",
};

function InvoicesTab({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    getClientInvoices(clientId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (invoiceId: string, status: ClientInvoice["status"]) => {
    await updateInvoiceStatus(clientId, invoiceId, status);
    load();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    const amountCents = Math.round(parsedAmount * 100);
    const dueDate = form.dueDate ? new Date(form.dueDate) : null;

    setSubmitting(true);
    try {
      await createInvoice(clientId, {
        type: form.type,
        amountCents,
        currency: form.currency.trim() || "USD",
        description: form.description.trim(),
        dueDate,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className={formStyles.actions}>
        <Button variant="primary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "New Invoice"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className={formStyles.form}>
            <div className={formStyles.field}>
              <label htmlFor="inv-type" className={formStyles.label}>Type</label>
              <select
                id="inv-type"
                className={formStyles.select}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ClientInvoice["type"] }))}
              >
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>

            <div className={formStyles.field}>
              <label htmlFor="inv-description" className={formStyles.label}>Description</label>
              <input
                id="inv-description"
                type="text"
                placeholder="e.g. Website redesign — Phase 1"
                className={formStyles.select}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className={formStyles.twoCol}>
              <div className={formStyles.field}>
                <label htmlFor="inv-amount" className={formStyles.label}>Amount</label>
                <input
                  id="inv-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="150.00"
                  className={formStyles.select}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>

              <div className={formStyles.field}>
                <label htmlFor="inv-currency" className={formStyles.label}>Currency</label>
                <select
                  id="inv-currency"
                  className={formStyles.select}
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                >
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className={formStyles.field}>
              <label htmlFor="inv-due" className={formStyles.label}>Due Date (optional)</label>
              <input
                id="inv-due"
                type="date"
                className={formStyles.select}
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            {formError && <p className={formStyles.errorMsg}>{formError}</p>}

            <div className={formStyles.actions}>
              <Button type="submit" variant="primary" loading={submitting}>
                Create Invoice
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : items.length === 0 ? (
        <p className={styles.empty}>No invoices yet.</p>
      ) : (
        <div className={styles.docList}>
          {items.map((inv) => (
            <div key={inv.id} className={styles.docItem}>
              <div className={styles.docInfo}>
                <span className="text-body font-semibold">{inv.description}</span>
                <span className="text-body-sm text-muted">
                  {formatCurrency(inv.amountCents, inv.currency)}
                  {inv.dueDate?.toDate && ` · Due ${inv.dueDate.toDate().toLocaleDateString()}`}
                </span>
              </div>
              <div className={styles.docActions}>
                <Badge variant={INVOICE_STATUS_VARIANT[inv.status]}>
                  {INVOICE_STATUS_LABEL[inv.status]}
                </Badge>
                <select
                  className={formStyles.select}
                  value={inv.status}
                  onChange={(e) => handleStatusChange(inv.id, e.target.value as ClientInvoice["status"])}
                  aria-label={`Change status for ${inv.description}`}
                >
                  {INVOICE_STATUSES.map((s) => (
                    <option key={s} value={s}>{INVOICE_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
