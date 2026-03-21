import type { ClientInvoice } from "@/lib/types";

export const INVOICE_STATUS_VARIANT: Record<
  ClientInvoice["status"],
  "published" | "draft" | "featured" | "neutral"
> = {
  paid: "published",
  sent: "featured",
  pending: "draft",
  draft: "neutral",
  failed: "neutral",
  refunded: "neutral",
};

export const INVOICE_STATUS_LABEL: Record<ClientInvoice["status"], string> = {
  paid: "Paid",
  sent: "Sent",
  pending: "Pending",
  draft: "Draft",
  failed: "Failed",
  refunded: "Refunded",
};
