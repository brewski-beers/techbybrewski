"use client";

import { useEffect, useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { getAllTestimonials } from "@/lib/firestore/queries";
import { reorderTestimonials } from "@/lib/firestore/mutations";
import { Testimonial } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import styles from "@/styles/adminList.module.css";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);

  useEffect(() => {
    getAllTestimonials().then(setItems).finally(() => setLoading(false));
  }, []);

  const handleReorder = (reordered: Testimonial[]) => {
    setReorderError(null);
    startTransition(async () => {
      setOptimisticItems(reordered);
      try {
        await reorderTestimonials(reordered.map((t, i) => ({ id: t.id, order: i + 1 })));
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
          <h1 className="text-h2">Testimonials</h1>
          <p className="text-body text-muted">{items.length} total</p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button>+ New Testimonial</Button>
        </Link>
      </div>

      {reorderError && <p className={styles.errorMsg}>{reorderError}</p>}

      {loading ? (
        <div className={styles.list}>
          {[1, 2].map((n) => (
            <div key={n} className={`skeleton ${styles.skeleton}`} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <p className="text-body text-muted">
            No testimonials yet.{" "}
            <Link href="/admin/testimonials/new" className="text-accent">
              Add one →
            </Link>
          </p>
        </Card>
      ) : (
        <div className={`${styles.list} ${isPending ? styles.listPending : ""}`}>
          <SortableList items={optimisticItems} onReorder={handleReorder}>
            {(t, handleProps) => (
              <div className={styles.item}>
                <DragHandle listeners={handleProps.listeners} attributes={handleProps.attributes} />
                <Link href={`/admin/testimonials/edit?id=${t.id}`} className={styles.itemMain}>
                  <span className="text-body font-semibold">{t.name}</span>
                  <span className="text-body-sm text-muted">
                    {t.title} · {t.company}
                  </span>
                </Link>
                <Badge variant={t.isPublished ? "published" : "draft"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            )}
          </SortableList>
        </div>
      )}
    </div>
  );
}
