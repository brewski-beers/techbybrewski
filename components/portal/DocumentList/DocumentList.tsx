"use client";

import type { ClientDocument, ClientContract } from "@/lib/types";
import { Badge } from "@/components/ui";
import styles from "@/styles/portal.module.css";

const SIGNATURE_VARIANT: Record<ClientContract["signatureStatus"], "published" | "draft" | "neutral"> = {
  signed: "published",
  pending: "draft",
  none: "neutral",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentListProps {
  items: (ClientDocument | ClientContract)[];
  showSignature?: boolean;
}

export default function DocumentList({ items, showSignature = false }: DocumentListProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>No documents yet.</p>;
  }

  return (
    <div className={styles.docList}>
      {items.map((item) => {
        const contract = showSignature ? (item as ClientContract) : null;
        return (
          <div key={item.id} className={styles.docItem}>
            <div className={styles.docInfo}>
              <span className="text-body font-semibold">{item.name}</span>
              <span className="text-body-sm text-muted">
                {item.fileName} · {formatSize(item.fileSizeBytes)} · Uploaded by {item.uploadedBy}
              </span>
            </div>
            <div className={styles.docActions}>
              {contract && (
                <>
                  <Badge variant={SIGNATURE_VARIANT[contract.signatureStatus]}>
                    {contract.signatureStatus === "none"
                      ? "No signature"
                      : contract.signatureStatus.charAt(0).toUpperCase() + contract.signatureStatus.slice(1)}
                  </Badge>
                  {contract.signatureUrl && contract.signatureStatus === "pending" && (
                    <a
                      href={contract.signatureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-body-sm"
                    >
                      Sign →
                    </a>
                  )}
                </>
              )}
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent text-body-sm"
              >
                Download
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
