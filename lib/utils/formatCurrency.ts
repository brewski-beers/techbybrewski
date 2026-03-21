/**
 * Format an amount in cents to a display currency string.
 * @param amountCents - Amount in smallest currency unit (e.g., cents)
 * @param currency - ISO 4217 currency code (default: "USD")
 */
export function formatCurrency(amountCents: number, currency = "USD"): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
