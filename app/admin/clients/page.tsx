"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllClients, subscribeToAdminUnreadCounts } from "@/lib/firestore/portalQueries";
import { Client } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import styles from "@/styles/adminList.module.css";

const STATUS_VARIANT: Record<Client["status"], "published" | "draft" | "neutral"> = {
  active: "published",
  paused: "draft",
  archived: "neutral",
};

export default function AdminClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getAllClients().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub = subscribeToAdminUnreadCounts(setUnreadCounts);
    return unsub;
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Clients</h1>
          <p className="text-body text-muted">{items.length} total</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>+ New Client</Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={`skeleton ${styles.skeleton}`} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-body text-muted">
            No clients yet.{" "}
            <Link href="/admin/clients/new" className="text-accent">
              Add one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className={styles.list}>
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clients/view?id=${c.id}`}
              className={styles.item}
            >
              <div className={styles.itemMain}>
                <span className="text-body font-semibold">
                  {c.companyName}
                  {(unreadCounts[c.id] ?? 0) > 0 && (
                    <span className={styles.unreadDot} aria-label={`${unreadCounts[c.id]} unread messages`} />
                  )}
                </span>
                <span className="text-body-sm text-muted">
                  {c.contactName} · {c.email}
                </span>
              </div>
              <Badge variant={STATUS_VARIANT[c.status]}>
                {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
