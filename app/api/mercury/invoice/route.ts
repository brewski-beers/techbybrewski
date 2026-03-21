import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createMercuryInvoice, isMercuryConfigured } from "@/lib/mercury";
import type { ClientInvoice } from "@/lib/types";

/**
 * POST /api/mercury/invoice
 *
 * Admin-only. Creates a Mercury invoice for an existing Firestore invoice doc
 * and writes back mercuryInvoiceId + mercuryPaymentUrl.
 *
 * Body: { clientUid: string; invoiceId: string; recipientEmail: string }
 *
 * BLOCKED: Requires LLC formation + Mercury banking account before going live.
 * Env vars needed: MERCURY_API_KEY
 */
export async function POST(req: NextRequest) {
  // Verify caller is an admin
  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMercuryConfigured()) {
    return NextResponse.json(
      { error: "Mercury is not configured. Set MERCURY_API_KEY to enable." },
      { status: 503 }
    );
  }

  const { clientUid, invoiceId, recipientEmail } = await req.json() as {
    clientUid: string;
    invoiceId: string;
    recipientEmail: string;
  };

  if (!clientUid || !invoiceId || !recipientEmail) {
    return NextResponse.json(
      { error: "clientUid, invoiceId, and recipientEmail are required" },
      { status: 400 }
    );
  }

  // Fetch the Firestore invoice doc
  const invoiceRef = adminDb.doc(`clients/${clientUid}/invoices/${invoiceId}`);
  const snap = await invoiceRef.get();

  if (!snap.exists) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const invoice = { id: snap.id, ...snap.data() } as ClientInvoice;

  if (invoice.mercuryInvoiceId) {
    return NextResponse.json(
      { error: "Mercury invoice already exists for this record" },
      { status: 409 }
    );
  }

  try {
    const mercuryInvoice = await createMercuryInvoice({
      amountCents: invoice.amountCents,
      currency: invoice.currency,
      description: invoice.description,
      recipientEmail,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate.seconds * 1000).toISOString().split("T")[0] : null,
    });

    if (!mercuryInvoice) {
      return NextResponse.json({ error: "Mercury returned no invoice" }, { status: 502 });
    }

    await invoiceRef.update({
      mercuryInvoiceId: mercuryInvoice.id,
      mercuryPaymentUrl: mercuryInvoice.paymentUrl,
      status: "sent",
    });

    return NextResponse.json({
      ok: true,
      mercuryInvoiceId: mercuryInvoice.id,
      mercuryPaymentUrl: mercuryInvoice.paymentUrl,
    });
  } catch (err: unknown) {
    console.error("Mercury invoice creation error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
