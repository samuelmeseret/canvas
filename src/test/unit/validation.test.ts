import { describe, expect, it } from "vitest";
import { createBoardSchema } from "@/lib/validation";

describe("createBoardSchema", () => {
  it("accepts valid payload", () => {
    const result = createBoardSchema.safeParse({
      title: "Team planning",
      creatorName: "Sam",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing values", () => {
    const result = createBoardSchema.safeParse({
      title: "",
      creatorName: " ",
    });

    expect(result.success).toBe(false);
  });
});
