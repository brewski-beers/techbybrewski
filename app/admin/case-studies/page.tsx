"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllCaseStudies } from "@/lib/firestore/queries";
import { CaseStudy } from "@/lib/types";
import { AdminButton, AdminBadge, AdminCard } from "@/components/admin/ui";
import styles from "@/styles/adminList.module.css";

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAllCaseStudies().then(setItems).finally(() => setLoading(false)); }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Case Studies</h1>
          <p className="text-body text-muted">{items.length} total</p>
        </div>
        <Link href="/admin/case-studies/new"><AdminButton>+ New Case Study</AdminButton></Link>
      </div>

      {loading ? (
        <div className={styles.list}>{[1,2,3].map((n) => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      ) : items.length === 0 ? (
        <AdminCard><p className="text-body text-muted">No case studies yet. <Link href="/admin/case-studies/new" className="text-accent">Create one →</Link></p></AdminCard>
      ) : (
        <div className={styles.list}>
          {items.map((c) => (
            <Link key={c.id} href={`/admin/case-studies/edit?id=${c.id}`} className={styles.item}>
              <div className={styles.itemMain}>
                <span className="text-body font-semibold">{c.title}</span>
                <span className="text-body-sm text-muted">{c.clientName} · {c.industry}</span>
              </div>
              <div className={styles.itemMeta}>
                {c.featured && <AdminBadge variant="featured">Featured</AdminBadge>}
                <AdminBadge variant={c.isPublished ? "published" : "draft"}>{c.isPublished ? "Published" : "Draft"}</AdminBadge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
