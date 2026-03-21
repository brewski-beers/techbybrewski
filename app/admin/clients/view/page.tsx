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
import { updateInvoiceStatus } from "@/lib/firestore/portalMutations";
import DocumentList from "@/components/portal/DocumentList/DocumentList";
import FileUpload from "@/components/portal/FileUpload/FileUpload";
import MessageThread from "@/components/portal/MessageThread/MessageThread";
import { Button, Badge, Card } from "@/components/ui";
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

const INVOICE_STATUS_VARIANT: Record<ClientInvoice["status"], "published" | "draft" | "featured" | "neutral"> = {
  paid: "published",
  sent: "featured",
  pending: "draft",
  draft: "neutral",
  failed: "neutral",
  refunded: "neutral",
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
        ) : (
          <DocumentList items={items} showSignature={activeCategory === "contracts"} />
        )}
      </div>
    </div>
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
              ${(inv.amountCents / 100).toFixed(2)} {inv.currency.toUpperCase()}
              {inv.dueDate?.toDate && ` · Due ${inv.dueDate.toDate().toLocaleDateString()}`}
            </span>
          </div>
          <div className={styles.docActions}>
            <Badge variant={INVOICE_STATUS_VARIANT[inv.status]}>
              {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
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
