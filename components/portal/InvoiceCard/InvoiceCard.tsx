import Badge from "@/components/ui/Badge";
import { INVOICE_STATUS_VARIANT, INVOICE_STATUS_LABEL } from "@/lib/constants/invoiceStatus";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { ClientInvoice } from "@/lib/types";
import styles from "./InvoiceCard.module.css";

interface InvoiceCardProps {
  invoice: ClientInvoice;
  showPayButton?: boolean;
}

function formatDate(ts: { seconds: number } | null): string {
  if (!ts) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InvoiceCard({ invoice, showPayButton = false }: InvoiceCardProps) {
  const isPending = invoice.status === "pending" || invoice.status === "sent";
  const hasPayUrl = !!invoice.mercuryPaymentUrl;

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.description}>{invoice.description}</span>
        <div className={styles.meta}>
          <Badge variant={INVOICE_STATUS_VARIANT[invoice.status]}>
            {INVOICE_STATUS_LABEL[invoice.status]}
          </Badge>
          {invoice.dueDate && (
            <span>Due {formatDate(invoice.dueDate)}</span>
          )}
          <span>{invoice.type === "recurring" ? "Recurring" : "One-time"}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <span className={styles.amount}>
          {formatCurrency(invoice.amountCents, invoice.currency)}
        </span>
        {showPayButton && isPending && hasPayUrl && (
          <a
            href={invoice.mercuryPaymentUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Pay
          </a>
        )}
      </div>
    </div>
  );
}
