"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllFAQs } from "@/lib/firestore/queries";
import { FAQ } from "@/lib/types";
import { AdminButton, AdminBadge, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminList.module.css";

export default function AdminFAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAllFAQs().then(setItems).finally(() => setLoading(false)); }, []);
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className="text-h2">FAQs</h1><p className="text-body text-muted">{items.length} total</p></div>
        <Link href="/admin/faqs/new"><AdminButton>+ New FAQ</AdminButton></Link>
      </div>
      {loading ? <div className={styles.list}>{[1,2].map(n => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      : items.length === 0 ? <AdminCard><p className="text-body text-muted">No FAQs yet. <Link href="/admin/faqs/new" className="text-accent">Add one →</Link></p></AdminCard>
      : <div className={styles.list}>{items.map(f => (
          <Link key={f.id} href={`/admin/faqs/edit?id=${f.id}`} className={styles.item}>
            <div className={styles.itemMain}>
              <span className="text-body font-semibold">{f.question}</span>
              {f.category && <span className="text-body-sm text-muted">{f.category}</span>}
            </div>
            <AdminBadge variant={f.isPublished ? "published" : "draft"}>{f.isPublished ? "Published" : "Draft"}</AdminBadge>
          </Link>
        ))}</div>}
    </div>
  );
}
