import { describe, it, expect } from "vitest";
import { slugify } from "../../utils.ts";

describe("slugify", () => {
  it("converts a normal string to a slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("strips special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple spaces/hyphens", () => {
    expect(slugify("foo   bar--baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("strips unicode characters that are not a-z0-9", () => {
    expect(slugify("café au lait")).toBe("caf-au-lait");
  });
});
