"use client";

import { useEffect, useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { getAllCaseStudies } from "@/lib/firestore/queries";
import { reorderCaseStudies } from "@/lib/firestore/mutations";
import { CaseStudy } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import styles from "@/styles/adminList.module.css";

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);

  useEffect(() => {
    getAllCaseStudies().then(setItems).finally(() => setLoading(false));
  }, []);

  const handleReorder = (reordered: CaseStudy[]) => {
    setReorderError(null);
    startTransition(async () => {
      setOptimisticItems(reordered);
      try {
        await reorderCaseStudies(reordered.map((c, i) => ({ id: c.id, order: i + 1 })));
        setItems(reordered);
      } catch {
        setReorderError("Reorder failed. Please try again.");
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className="text-h2">Case Studies</h1>
          <p className="text-body text-muted">{items.length} total</p>
        </div>
        <Link href="/admin/case-studies/new">
          <Button>+ New Case Study</Button>
        </Link>
      </div>

      {reorderError && <p className={styles.errorMsg}>{reorderError}</p>}

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={`skeleton ${styles.skeleton}`} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-body text-muted">
            No case studies yet.{" "}
            <Link href="/admin/case-studies/new" className="text-accent">
              Create one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className={`${styles.list} ${isPending ? styles.listPending : ""}`}>
          <SortableList items={optimisticItems} onReorder={handleReorder}>
            {(c, handleProps) => (
              <div className={styles.item}>
                <DragHandle listeners={handleProps.listeners} attributes={handleProps.attributes} />
                <Link href={`/admin/case-studies/edit?id=${c.id}`} className={styles.itemMain}>
                  <span className="text-body font-semibold">{c.title}</span>
                  <span className="text-body-sm text-muted">
                    {c.clientName} · {c.industry}
                  </span>
                </Link>
                <div className={styles.itemMeta}>
                  {c.featured && <Badge variant="featured">Featured</Badge>}
                  <Badge variant={c.isPublished ? "published" : "draft"}>
                    {c.isPublished ? "Published" : "Draft"}
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
