"use client";
import { useEffect, useState } from "react";
import { getRecentActivity } from "@/lib/firestore/queries";
import { ActivityLogEntry } from "@/lib/types";
import { Card, Badge } from "@/components/ui";
import styles from "./page.module.css";

export default function ActivityLogPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getRecentActivity(50).then(setEntries).finally(() => setLoading(false)); }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className="text-h2">Activity Log</h1>
        <p className="text-body text-muted">Last 50 admin actions.</p>
      </div>
      <Card>
        {loading ? (
          <div className={styles.list}>{[1,2,3,4,5].map(n => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
        ) : entries.length === 0 ? (
          <p className="text-body text-muted">No activity recorded yet.</p>
        ) : (
          <ul className={styles.list}>
            {entries.map(e => (
              <li key={e.id} className={styles.entry}>
                <div className={styles.entryMain}>
                  <Badge variant="neutral">{e.action}</Badge>
                  <span className="text-body-sm">{e.changesSummary}</span>
                </div>
                <div className={styles.entryMeta}>
                  <span className="text-caption text-muted">{e.actorEmail}</span>
                  <span className="text-caption text-muted">
                    {e.timestamp?.toDate?.()?.toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
