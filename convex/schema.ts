import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    boardId: v.string(),
    roomId: v.string(),
    title: v.string(),
    creatorName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board_id", ["boardId"])
    .index("by_created_at", ["createdAt"]),
});
