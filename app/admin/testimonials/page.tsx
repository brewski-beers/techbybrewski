"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllTestimonials } from "@/lib/firestore/queries";
import { Testimonial } from "@/lib/types";
import { AdminButton, AdminBadge, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminList.module.css";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAllTestimonials().then(setItems).finally(() => setLoading(false)); }, []);
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className="text-h2">Testimonials</h1><p className="text-body text-muted">{items.length} total</p></div>
        <Link href="/admin/testimonials/new"><AdminButton>+ New Testimonial</AdminButton></Link>
      </div>
      {loading ? <div className={styles.list}>{[1,2].map(n => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      : items.length === 0 ? <AdminCard><p className="text-body text-muted">No testimonials yet. <Link href="/admin/testimonials/new" className="text-accent">Add one →</Link></p></AdminCard>
      : <div className={styles.list}>{items.map(t => (
          <Link key={t.id} href={`/admin/testimonials/${t.id}`} className={styles.item}>
            <div className={styles.itemMain}>
              <span className="text-body font-semibold">{t.name}</span>
              <span className="text-body-sm text-muted">{t.title} · {t.company}</span>
            </div>
            <AdminBadge variant={t.isPublished ? "published" : "draft"}>{t.isPublished ? "Published" : "Draft"}</AdminBadge>
          </Link>
        ))}</div>}
    </div>
  );
}
