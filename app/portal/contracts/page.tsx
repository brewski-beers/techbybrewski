"use client";

import { useCallback, useEffect, useState } from "react";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { getClientContracts } from "@/lib/firestore/portalQueries";
import DocumentList from "@/components/portal/DocumentList/DocumentList";
import FileUpload from "@/components/portal/FileUpload/FileUpload";
import type { ClientContract } from "@/lib/types";
import styles from "@/styles/portal.module.css";

export default function PortalContractsPage() {
  const { clientId } = usePortalUser();
  const [items, setItems] = useState<ClientContract[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getClientContracts(clientId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.headerTitle}`}>Contracts</h1>
      </div>

      <FileUpload clientId={clientId} category="contracts" onComplete={load} />

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : (
        <DocumentList items={items} showSignature />
      )}
    </div>
  );
}
