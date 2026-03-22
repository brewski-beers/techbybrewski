import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/ui/Badge", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("./InvoiceCard.module.css", () => ({ default: {} }));

import InvoiceCard from "./InvoiceCard";
import type { ClientInvoice } from "@/lib/types";

const base: ClientInvoice = {
  id: "inv-1",
  type: "one-time",
  amountCents: 15000,
  currency: "USD",
  description: "Web project deposit",
  status: "paid",
  mercuryInvoiceId: null,
  mercuryPaymentUrl: null,
  paidAt: null,
  dueDate: null,
  createdAt: { seconds: 1700000000, nanoseconds: 0 },
};

describe("InvoiceCard", () => {
  it("renders a paid invoice with paid badge and no pay button", () => {
    // Given: an invoice with status "paid"
    // When: InvoiceCard renders
    render(<InvoiceCard invoice={{ ...base, status: "paid" }} />);

    // Then: "Paid" badge is displayed
    expect(screen.getByTestId("badge")).toHaveTextContent("Paid");

    // And: no pay button is shown
    expect(screen.queryByRole("link", { name: /pay/i })).toBeNull();
  });

  it("renders a pending invoice with pay button when showPayButton and payment URL exist", () => {
    // Given: an invoice with status "pending" and a payment URL
    const invoice: ClientInvoice = {
      ...base,
      status: "pending",
      mercuryPaymentUrl: "https://pay.mercury.com/inv-1",
    };

    // When: InvoiceCard renders with showPayButton=true
    render(<InvoiceCard invoice={invoice} showPayButton />);

    // Then: "Pending" badge is displayed
    expect(screen.getByTestId("badge")).toHaveTextContent("Pending");

    // And: a pay button links to the payment URL
    const link = screen.getByRole("link", { name: /pay/i });
    expect(link).toHaveAttribute("href", "https://pay.mercury.com/inv-1");
  });

  it("renders an overdue invoice (status sent, past dueDate) with sent badge", () => {
    // Given: an invoice with status "sent" and dueDate in the past
    const invoice: ClientInvoice = {
      ...base,
      status: "sent",
      dueDate: { seconds: 1000000000, nanoseconds: 0 }, // past date
    };

    // When: InvoiceCard renders
    render(<InvoiceCard invoice={invoice} />);

    // Then: a "Sent" badge is displayed (overdue indicator via badge)
    expect(screen.getByTestId("badge")).toHaveTextContent("Sent");
  });

  it("renders a draft invoice with draft badge", () => {
    // Given: an invoice with status "draft"
    // When: InvoiceCard renders
    render(<InvoiceCard invoice={{ ...base, status: "draft" }} />);

    // Then: "Draft" badge is displayed
    expect(screen.getByTestId("badge")).toHaveTextContent("Draft");
  });

  it("formats currency amount correctly", () => {
    // Given: an invoice with amountCents of 15000 and currency "USD"
    // When: InvoiceCard renders
    render(<InvoiceCard invoice={{ ...base, amountCents: 15000, currency: "USD" }} />);

    // Then: "$150.00" is displayed
    expect(screen.getByText("$150.00")).toBeInTheDocument();
  });
});
