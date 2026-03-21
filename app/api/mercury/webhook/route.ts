import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Mercury payment webhook handler.
 *
 * Mercury sends a POST with a JSON payload and a signature header:
 *   Mercury-Signature: sha256=<hmac-hex>
 *
 * We verify the signature using MERCURY_WEBHOOK_SECRET, then update the
 * Firestore invoice whose mercuryInvoiceId matches the event's invoiceId.
 *
 * BLOCKED: Requires LLC formation + Mercury banking account before going live.
 * Env vars needed: MERCURY_WEBHOOK_SECRET
 */

function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.MERCURY_WEBHOOK_SECRET;
  if (!secret || !header) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = header.replace("sha256=", "");

  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

/**
 * Mercury invoice status → our internal invoice status mapping.
 * Extend as Mercury adds more statuses.
 */
function mapMercuryStatus(
  mercuryStatus: string
): "draft" | "sent" | "pending" | "paid" | "failed" | "refunded" | null {
  switch (mercuryStatus.toLowerCase()) {
    case "paid":
      return "paid";
    case "pending":
      return "pending";
    case "sent":
      return "sent";
    case "failed":
    case "cancelled":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("mercury-signature");

  if (!verifySignature(rawBody, signature)) {
    console.warn("Mercury webhook: invalid or missing signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mercuryInvoiceId = payload.invoiceId as string | undefined;
  const mercuryStatus = payload.status as string | undefined;

  if (!mercuryInvoiceId || !mercuryStatus) {
    return NextResponse.json({ error: "Missing invoiceId or status" }, { status: 400 });
  }

  const internalStatus = mapMercuryStatus(mercuryStatus);
  if (!internalStatus) {
    // Unrecognized status — acknowledge receipt without error
    console.log(`Mercury webhook: unrecognized status "${mercuryStatus}", skipping`);
    return NextResponse.json({ ok: true });
  }

  // Find the matching invoice across all clients using a collection group query
  try {
    const snap = await adminDb
      .collectionGroup("invoices")
      .where("mercuryInvoiceId", "==", mercuryInvoiceId)
      .limit(1)
      .get();

    if (snap.empty) {
      console.warn(`Mercury webhook: no invoice found for mercuryInvoiceId=${mercuryInvoiceId}`);
      // Return 200 so Mercury doesn't retry — the invoice may have been deleted
      return NextResponse.json({ ok: true });
    }

    const invoiceRef = snap.docs[0].ref;
    const update: Record<string, unknown> = { status: internalStatus };

    if (internalStatus === "paid") {
      update.paidAt = FieldValue.serverTimestamp();
    }

    await invoiceRef.update(update);

    console.log(
      `Mercury webhook: updated invoice ${invoiceRef.id} → status=${internalStatus}`
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mercury webhook: Firestore update failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
