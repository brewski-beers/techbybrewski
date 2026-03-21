"use client";

import { usePortalUser } from "@/components/portal/ClientAuthProvider/ClientAuthProvider";
import MessageThread from "@/components/portal/MessageThread/MessageThread";
import styles from "@/styles/portal.module.css";

export default function PortalMessagesPage() {
  const { clientId } = usePortalUser();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={`text-h2 ${styles.headerTitle}`}>Messages</h1>
      </div>

      <MessageThread clientId={clientId} viewerRole="client" />
    </div>
  );
}
