import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createBoard = mutation({
  args: {
    boardId: v.string(),
    roomId: v.string(),
    title: v.string(),
    creatorName: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    await ctx.db.insert("boards", {
      boardId: args.boardId,
      roomId: args.roomId,
      title: args.title,
      creatorName: args.creatorName,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      boardId: args.boardId,
      roomId: args.roomId,
      title: args.title,
      creatorName: args.creatorName,
      createdAt: new Date(timestamp).toISOString(),
    };
  },
});

export const getBoardById = query({
  args: {
    boardId: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db
      .query("boards")
      .withIndex("by_board_id", (q) => q.eq("boardId", args.boardId))
      .first();

    if (!board) {
      return null;
    }

    return {
      boardId: board.boardId,
      roomId: board.roomId,
      title: board.title,
      creatorName: board.creatorName,
      createdAt: new Date(board.createdAt).toISOString(),
    };
  },
});

export const listBoards = query({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_created_at")
      .order("desc")
      .take(args.limit);

    return boards.map((board) => ({
      boardId: board.boardId,
      roomId: board.roomId,
      title: board.title,
      creatorName: board.creatorName,
      createdAt: new Date(board.createdAt).toISOString(),
    }));
  },
});
