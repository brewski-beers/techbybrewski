"use client";

import { useEffect, useState } from "react";
import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import { getClient } from "@/lib/firestore/portalQueries";
import type { Client } from "@/lib/types";
import styles from "@/styles/portal.module.css";
import settingsStyles from "./settings.module.css";

export default function PortalSettingsPage() {
  const { clientId } = usePortalUser();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(clientId)
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.headerTitle}`}>Settings</h1>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : !client ? (
        <div className={styles.empty}>Profile not found.</div>
      ) : (
        <div className={settingsStyles.card}>
          <h2 className={`text-label ${settingsStyles.sectionTitle}`}>Profile</h2>
          <dl className={settingsStyles.fieldList}>
            <ProfileField label="Name" value={client.contactName} />
            <ProfileField label="Email" value={client.email} />
            <ProfileField label="Company" value={client.companyName} />
            <ProfileField
              label="Services"
              value={client.services.length > 0 ? client.services.join(", ") : "—"}
            />
            <ProfileField label="Status" value={client.status} />
          </dl>
          <p className={`text-body-sm ${settingsStyles.note}`}>
            To update your profile, contact TechByBrewski directly.
          </p>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className={settingsStyles.field}>
      <dt className={`text-body-sm ${settingsStyles.fieldLabel}`}>{label}</dt>
      <dd className={`text-body ${settingsStyles.fieldValue}`}>{value || "—"}</dd>
    </div>
  );
}
