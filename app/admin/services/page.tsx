"use client";

import { useEffect, useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { getAllServices } from "@/lib/firestore/queries";
import { reorderServices } from "@/lib/firestore/mutations";
import { Service } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import styles from "@/styles/adminList.module.css";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticServices, setOptimisticServices] = useOptimistic(services);

  useEffect(() => {
    getAllServices().then(setServices).finally(() => setLoading(false));
  }, []);

  const handleReorder = (reordered: Service[]) => {
    setReorderError(null);
    startTransition(async () => {
      setOptimisticServices(reordered);
      try {
        await reorderServices(reordered.map((s, i) => ({ id: s.id, order: i + 1 })));
        setServices(reordered);
      } catch {
        setReorderError("Reorder failed. Please try again.");
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Services</h1>
          <p className="text-body text-muted">{services.length} total</p>
        </div>
        <Link href="/admin/services/new">
          <Button>+ New Service</Button>
        </Link>
      </div>

      {reorderError && <p className={styles.errorMsg}>{reorderError}</p>}

      {loading ? (
        <div className={styles.list}>{[1, 2, 3].map((n) => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      ) : services.length === 0 ? (
        <Card><p className="text-body text-muted">No services yet. <Link href="/admin/services/new" className="text-accent">Create one →</Link></p></Card>
      ) : (
        <div className={`${styles.list} ${isPending ? styles.listPending : ""}`}>
          <SortableList items={optimisticServices} onReorder={handleReorder}>
            {(s, handleProps) => (
              <div className={styles.item}>
                <DragHandle listeners={handleProps.listeners} attributes={handleProps.attributes} />
                <Link href={`/admin/services/edit?id=${s.id}`} className={styles.itemMain}>
                  <span className="text-body font-semibold">{s.name}</span>
                  <span className="text-body-sm text-muted">/services/{s.slug}</span>
                </Link>
                <div className={styles.itemMeta}>
                  <Badge variant={s.isPublished ? "published" : "draft"}>
                    {s.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            )}
          </SortableList>
        </div>
      )}
    </div>
  );
}
