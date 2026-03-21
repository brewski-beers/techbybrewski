"use client";

import { useCallback, useEffect, useState } from "react";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { getClientDocuments } from "@/lib/firestore/portalQueries";
import DocumentList from "@/components/portal/DocumentList/DocumentList";
import FileUpload from "@/components/portal/FileUpload/FileUpload";
import type { ClientDocument, DocumentCategory } from "@/lib/types";
import styles from "@/styles/portal.module.css";

const CATEGORIES: { key: Exclude<DocumentCategory, "contracts">; label: string }[] = [
  { key: "deliverables", label: "Deliverables" },
  { key: "assets", label: "Assets" },
  { key: "files", label: "Other Files" },
];

export default function PortalDocumentsPage() {
  const { clientId } = usePortalUser();
  const [activeTab, setActiveTab] = useState<Exclude<DocumentCategory, "contracts">>("deliverables");
  const [items, setItems] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getClientDocuments(clientId, activeTab)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId, activeTab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.headerTitle}`}>Documents</h1>
      </div>

      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.tab} ${activeTab === cat.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <FileUpload clientId={clientId} category={activeTab} onComplete={load} />

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : (
        <DocumentList items={items} />
      )}
    </div>
  );
}
