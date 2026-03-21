"use client";
import { useEffect, useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { getAllFAQs } from "@/lib/firestore/queries";
import { reorderFAQs } from "@/lib/firestore/mutations";
import { FAQ } from "@/lib/types";
import { Button, Badge, Card } from "@/components/ui";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import styles from "@/styles/adminList.module.css";

export default function AdminFAQsPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);

  useEffect(() => { getAllFAQs().then(setItems).finally(() => setLoading(false)); }, []);

  const handleReorder = (reordered: FAQ[]) => {
    setReorderError(null);
    startTransition(async () => {
      setOptimisticItems(reordered);
      try {
        await reorderFAQs(reordered.map((f, i) => ({ id: f.id, order: i + 1 })));
        setItems(reordered);
      } catch {
        setReorderError("Reorder failed. Please try again.");
      }
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div><h1 className="text-h2">FAQs</h1><p className="text-body text-muted">{items.length} total</p></div>
        <Link href="/admin/faqs/new"><Button>+ New FAQ</Button></Link>
      </div>

      {reorderError && <p className={styles.errorMsg}>{reorderError}</p>}

      {loading ? (
        <div className={styles.list}>{[1, 2].map(n => <div key={n} className={`skeleton ${styles.skeleton}`} />)}</div>
      ) : items.length === 0 ? (
        <Card><p className="text-body text-muted">No FAQs yet. <Link href="/admin/faqs/new" className="text-accent">Add one →</Link></p></Card>
      ) : (
        <div className={`${styles.list} ${isPending ? styles.listPending : ""}`}>
          <SortableList items={optimisticItems} onReorder={handleReorder}>
            {(f, handleProps) => (
              <div className={styles.item}>
                <DragHandle listeners={handleProps.listeners} attributes={handleProps.attributes} />
                <Link href={`/admin/faqs/edit?id=${f.id}`} className={styles.itemMain}>
                  <span className="text-body font-semibold">{f.question}</span>
                  {f.category && <span className="text-body-sm text-muted">{f.category}</span>}
                </Link>
                <Badge variant={f.isPublished ? "published" : "draft"}>{f.isPublished ? "Published" : "Draft"}</Badge>
              </div>
            )}
          </SortableList>
        </div>
      )}
    </div>
  );
}
