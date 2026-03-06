"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllServices } from "@/lib/firestore/queries";
import { Service } from "@/lib/types";
import { AdminButton, AdminBadge, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminList.module.css";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllServices().then(setServices).finally(() => setLoading(false)); }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Services</h1>
          <p className="text-body text-muted">{services.length} total</p>
        </div>
        <Link href="/admin/services/new">
          <AdminButton>+ New Service</AdminButton>
        </Link>
      </div>

      {loading ? (
        <div className={styles.list}>{[1,2,3].map((n) => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      ) : services.length === 0 ? (
        <AdminCard><p className="text-body text-muted">No services yet. <Link href="/admin/services/new" className="text-accent">Create one →</Link></p></AdminCard>
      ) : (
        <div className={styles.list}>
          {services.map((s) => (
            <Link key={s.id} href={`/admin/services/edit?id=${s.id}`} className={styles.item}>
              <div className={styles.itemMain}>
                <span className="text-body font-semibold">{s.name}</span>
                <span className="text-body-sm text-muted">/services/{s.slug}</span>
              </div>
              <div className={styles.itemMeta}>
                <span className="text-caption text-muted">Order: {s.order}</span>
                <AdminBadge variant={s.isPublished ? "published" : "draft"}>
                  {s.isPublished ? "Published" : "Draft"}
                </AdminBadge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
