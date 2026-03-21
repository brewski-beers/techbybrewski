/**
 * Mercury Invoicing API client.
 *
 * Gated by MERCURY_API_KEY — all exports are no-ops / null when the env var is
 * absent so the rest of the app works without credentials during development.
 *
 * Mercury API docs: https://docs.mercury.com/reference/invoices
 *
 * BLOCKED: Requires LLC formation + Mercury banking account before going live.
 */

const MERCURY_API_BASE = "https://api.mercury.com/api/v1";

export function isMercuryConfigured(): boolean {
  return Boolean(process.env.MERCURY_API_KEY);
}

interface MercuryInvoicePayload {
  /** Amount in cents */
  amountCents: number;
  currency: string;
  description: string;
  recipientEmail: string;
  /** ISO 8601 date string, e.g. "2025-12-31" */
  dueDate: string | null;
}

export interface MercuryInvoice {
  id: string;
  paymentUrl: string;
  status: string;
}

/**
 * Create a Mercury invoice. Returns null if Mercury is not configured.
 * Throws on API error.
 */
export async function createMercuryInvoice(
  payload: MercuryInvoicePayload
): Promise<MercuryInvoice | null> {
  if (!isMercuryConfigured()) return null;

  const res = await fetch(`${MERCURY_API_BASE}/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MERCURY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: payload.amountCents,
      currency: payload.currency,
      description: payload.description,
      recipient: { email: payload.recipientEmail },
      ...(payload.dueDate ? { dueDate: payload.dueDate } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercury createInvoice failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    paymentUrl: data.paymentUrl as string,
    status: data.status as string,
  };
}

/**
 * Fetch an existing Mercury invoice by ID. Returns null if not configured.
 * Throws on API error.
 */
export async function getMercuryInvoice(
  mercuryInvoiceId: string
): Promise<MercuryInvoice | null> {
  if (!isMercuryConfigured()) return null;

  const res = await fetch(`${MERCURY_API_BASE}/invoices/${mercuryInvoiceId}`, {
    headers: {
      Authorization: `Bearer ${process.env.MERCURY_API_KEY}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mercury getInvoice failed ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    paymentUrl: data.paymentUrl as string,
    status: data.status as string,
  };
}
