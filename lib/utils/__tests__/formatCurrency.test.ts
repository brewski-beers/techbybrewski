import { describe, it, expect } from "vitest";
import { formatCurrency } from "../formatCurrency";

describe("formatCurrency", () => {
  it("formats a normal cent amount to USD string", () => {
    expect(formatCurrency(4999)).toBe("$49.99");
  });

  it("formats zero cents", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a large value", () => {
    expect(formatCurrency(1000000)).toBe("$10,000.00");
  });

  it("accepts a non-default currency code", () => {
    expect(formatCurrency(500, "EUR")).toMatch(/€/);
  });
});
