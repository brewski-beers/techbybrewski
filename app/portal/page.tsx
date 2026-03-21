"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { getClient } from "@/lib/firestore/portalQueries";
import type { Client } from "@/lib/types";
import styles from "./page.module.css";

export default function PortalDashboard() {
  const { clientId } = usePortalUser();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(clientId)
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  const greeting = client?.contactName
    ? `Welcome, ${client.contactName.split(" ")[0]}`
    : "Welcome";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.title}`}>
          {loading ? "Loading…" : greeting}
        </h1>
        {client?.companyName && (
          <p className={`text-body ${styles.company}`}>{client.companyName}</p>
        )}
      </div>

      <div className={styles.grid}>
        <DashboardCard
          href="/portal/documents"
          label="Documents"
          description="Deliverables, assets, and files shared with you."
        />
        <DashboardCard
          href="/portal/contracts"
          label="Contracts"
          description="Agreements and signature requests."
        />
        <DashboardCard
          href="/portal/messages"
          label="Messages"
          description="Direct line to TechByBrewski."
        />
        <DashboardCard
          href="/portal/invoices"
          label="Invoices"
          description="Billing history and outstanding payments."
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link href={href} className={styles.card}>
      <span className={`text-label ${styles.cardLabel}`}>{label}</span>
      <p className={`text-body-sm ${styles.cardDescription}`}>{description}</p>
      <span className={styles.cardArrow} aria-hidden="true">→</span>
    </Link>
  );
}
