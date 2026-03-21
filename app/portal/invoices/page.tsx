"use client";

import { useCallback, useEffect, useState } from "react";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { getClientInvoices } from "@/lib/firestore/portalQueries";
import InvoiceCard from "@/components/portal/InvoiceCard/InvoiceCard";
import type { ClientInvoice } from "@/lib/types";
import styles from "@/styles/portal.module.css";

export default function PortalInvoicesPage() {
  const { clientId } = usePortalUser();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getClientInvoices(clientId)
      .then(setInvoices)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.headerTitle}`}>Invoices</h1>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : invoices.length === 0 ? (
        <div className={styles.empty}>No invoices yet.</div>
      ) : (
        <div className={styles.docList}>
          {invoices.map((inv) => (
            <InvoiceCard key={inv.id} invoice={inv} showPayButton />
          ))}
        </div>
      )}
    </div>
  );
}
