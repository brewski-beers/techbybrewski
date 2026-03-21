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
import { updateInvoiceStatus, updateContractSignature } from "@/lib/firestore/portalMutations";
import DocumentList from "@/components/portal/DocumentList/DocumentList";
import FileUpload from "@/components/portal/FileUpload/FileUpload";
import MessageThread from "@/components/portal/MessageThread/MessageThread";
import { Button, Badge, Card, Input } from "@/components/ui";
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

const SIGNATURE_VARIANT: Record<ClientContract["signatureStatus"], "published" | "draft" | "neutral"> = {
  signed: "published",
  pending: "draft",
  none: "neutral",
};

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

/* ── Documents Tab ─────────────────────────────────────────── */

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
        ) : activeCategory === "contracts" ? (
          <ContractList
            contracts={items as ClientContract[]}
            clientId={clientId}
            onUpdate={load}
          />
        ) : (
          <DocumentList items={items} showSignature={false} />
        )}
      </div>
    </div>
  );
}

/* ── Contract List (admin) ─────────────────────────────────── */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ContractList({
  contracts,
  clientId,
  onUpdate,
}: {
  contracts: ClientContract[];
  clientId: string;
  onUpdate: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editStatus, setEditStatus] = useState<ClientContract["signatureStatus"]>("none");
  const [saving, setSaving] = useState(false);

  if (contracts.length === 0) {
    return <p className={styles.empty}>No documents yet.</p>;
  }

  const startEdit = (contract: ClientContract) => {
    setEditingId(contract.id);
    setEditUrl(contract.signatureUrl ?? "");
    setEditStatus(contract.signatureStatus);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditUrl("");
    setEditStatus("none");
  };

  const saveEdit = async (docId: string) => {
    setSaving(true);
    try {
      await updateContractSignature(
        clientId,
        docId,
        editUrl.trim() || null,
        editUrl.trim() ? editStatus : "none"
      );
      setEditingId(null);
      onUpdate();
    } catch (err) {
      console.error("Failed to update signature:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {contracts.map((contract) => (
        <div key={contract.id} className={styles.docItem}>
          <div className={styles.docInfo}>
            <span className="text-body font-semibold">{contract.name}</span>
            <span className="text-body-sm text-muted">
              {contract.fileName} · {formatSize(contract.fileSizeBytes)} · Uploaded by {contract.uploadedBy}
            </span>
          </div>
          <div className={styles.docActions}>
            <Badge variant={SIGNATURE_VARIANT[contract.signatureStatus]}>
              {contract.signatureStatus === "none"
                ? "No signature"
                : contract.signatureStatus.charAt(0).toUpperCase() + contract.signatureStatus.slice(1)}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => startEdit(contract)}>
              Edit Signature
            </Button>
            <a
              href={contract.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-body-sm"
            >
              Download
            </a>
          </div>
          {editingId === contract.id && (
            <div className={formStyles.form}>
              <Input
                label="Signing URL"
                placeholder="https://app.dochub.com/..."
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <div className={formStyles.field}>
                <label className={formStyles.label} htmlFor={`sig-status-${contract.id}`}>
                  Signature Status
                </label>
                <select
                  id={`sig-status-${contract.id}`}
                  className={formStyles.select}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ClientContract["signatureStatus"])}
                >
                  <option value="none">None</option>
                  <option value="pending">Pending</option>
                  <option value="signed">Signed</option>
                </select>
              </div>
              <div className={formStyles.actions}>
                <Button variant="secondary" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => saveEdit(contract.id)} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/* ── Invoices Tab ──────────────────────────────────────────── */

function InvoicesTab({ clientId }: { clientId: string }) {
  const [items, setItems] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className={styles.empty}>Loading…</div>;
  if (items.length === 0) return <p className={styles.empty}>No invoices yet.</p>;

  return (
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
            {inv.status !== "paid" && inv.status !== "refunded" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusChange(inv.id, "paid")}
              >
                Mark Paid
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
