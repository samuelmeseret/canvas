import { describe, expect, it } from "vitest";
import { isValidDisplayName, sanitizeDisplayName } from "@/lib/display-name";

describe("display name helpers", () => {
  it("normalizes whitespace", () => {
    expect(sanitizeDisplayName("  Sam   Meseret ")).toBe("Sam Meseret");
  });

  it("rejects invalid display names", () => {
    expect(isValidDisplayName("a")).toBe(false);
    expect(isValidDisplayName("ok")).toBe(true);
  });
});
