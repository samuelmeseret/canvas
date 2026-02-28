import { describe, expect, it } from "vitest";
import { getStableColor } from "@/lib/colors";

describe("getStableColor", () => {
  it("is deterministic for the same seed", () => {
    expect(getStableColor("sam")).toBe(getStableColor("sam"));
  });

  it("returns a hex color", () => {
    expect(getStableColor("collab")).toMatch(/^#[A-Fa-f0-9]{6}$/);
  });
});
